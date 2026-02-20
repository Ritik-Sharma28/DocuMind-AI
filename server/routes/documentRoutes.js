import { Router } from "express";
import {
    uploadDocument, getDocuments, getDocument,
    deleteDocument, getStats,
} from "../controllers/documentController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { documentLimitMiddleware } from "../middleware/usageLimiter.js";

const router = Router();
router.use(protect);

router.post("/upload", documentLimitMiddleware, upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/stats", getStats);
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);

export default router;
