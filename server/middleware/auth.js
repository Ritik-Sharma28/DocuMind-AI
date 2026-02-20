import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {redisClient} from "../config/redisClient.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null;

        if (!token)
            return res.status(401).json({ message: "Not authorized — no token" });

        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Not authorized — token logged out" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user)
            return res.status(401).json({ message: "User not found" });

        next();
    } catch {
        res.status(401).json({ message: "Not authorized — token invalid" });
    }
};
