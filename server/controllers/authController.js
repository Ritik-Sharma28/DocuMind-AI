import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redisClient } from "../config/redisClient.js";

const token = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain at least one letter and one number"
            });
        }

        if (await User.findOne({ email }))
            return res.status(400).json({ message: "Email already in use" });

        const user = await User.create({ name, email, password });
        res.status(201).json({
            token: token(user._id),
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ message: "Invalid credentials" });

        res.json({
            token: token(user._id),
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMe = async (req, res) => res.json({ user: req.user });

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const exp = decoded.exp;
                const now = Math.floor(Date.now() / 1000);
                const ttl = exp - now;
                if (ttl > 0) {
                    await redisClient.setEx(`bl_${token}`, ttl, "true");
                }
            } catch (err) {
                // token might be expired already, ignore
            }
        }
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
