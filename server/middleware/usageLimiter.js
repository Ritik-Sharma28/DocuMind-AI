import { redisClient } from "../config/redisClient.js";

const getSecondsToMidnight = () => {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getHours() >= 0 && now.getHours() < 24 ? now.getFullYear() : now.getFullYear(), // handling year wraparound later implicitly
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
    );
    // Fixed timezone-independent midnight
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
};

export const createLimiter = (prefix, limit) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) {
                return next();
            }

            const key = `${prefix}:${req.user._id}`;
            const current = await redisClient.get(key);
            const count = current ? parseInt(current, 10) : 0;

            // Optional: attach to req to return in headers if needed
            req.rateLimit = {
                limit,
                current: count,
                remaining: Math.max(0, limit - count)
            };

            if (count >= limit) {
                return res.status(429).json({
                    message: "Limit hit",
                    type: prefix,
                    limit,
                    resetInSeconds: getSecondsToMidnight()
                });
            }

            // Increment and set expiry if it's new
            const multi = redisClient.multi();
            multi.incr(key);
            if (count === 0) {
                multi.expire(key, getSecondsToMidnight());
            }
            await multi.exec();

            req.rateLimit.remaining = Math.max(0, limit - (count + 1));
            next();
        } catch (err) {
            console.error(`Redis limiter error [${prefix}]:`, err);
            // In case of Redis failure, we might want to let the request through
            // so we don't break the app if Redis is down
            next();
        }
    };
};

export const chatLimitMiddleware = createLimiter("chat_limit", 6);
export const documentLimitMiddleware = createLimiter("doc_limit", 3);

// Endpoint to fetch current limits
export const getLimits = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const chatKey = `chat_limit:${req.user._id}`;
        const docKey = `doc_limit:${req.user._id}`;

        const [chatCount, docCount] = await Promise.all([
            redisClient.get(chatKey),
            redisClient.get(docKey)
        ]);

        const cCount = chatCount ? parseInt(chatCount, 10) : 0;
        const dCount = docCount ? parseInt(docCount, 10) : 0;

        res.json({
            chat: { limit: 6, used: cCount, remaining: Math.max(0, 6 - cCount) },
            document: { limit: 3, used: dCount, remaining: Math.max(0, 3 - dCount) },
            resetInSeconds: getSecondsToMidnight()
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to get limits" });
    }
};
