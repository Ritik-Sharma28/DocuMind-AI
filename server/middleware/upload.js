import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt", ".md"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext)
        ? cb(null, true)
        : cb(new Error(`File type ${ext} not supported`));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },          // 10 MB
});
