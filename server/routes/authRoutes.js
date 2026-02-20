import { Router } from "express";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { getLimits } from "../middleware/usageLimiter.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/limits", protect, getLimits);
router.post("/logout", protect, logout);

export default router;
