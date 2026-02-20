import { Router } from "express";
import {
    chat, chatStream, getConversations,
    getConversation, deleteConversation,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import { chatLimitMiddleware } from "../middleware/usageLimiter.js";

const router = Router();
router.use(protect);

router.post("/", chatLimitMiddleware, chat);
router.post("/stream", chatLimitMiddleware, chatStream);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);

export default router;
