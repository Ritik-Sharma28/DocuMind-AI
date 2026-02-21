import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "../.env" });

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { redisClient } from "./config/redisClient.js";
import { initPinecone } from "./config/pinecone.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// ── Security ──
app.use(helmet());
app.use(
  cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));

// ── Rate Limiting ──
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);

// ── Error Handler ──
app.use(errorHandler);

// ── Serve Frontend in Production ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// ── Start ──
(async () => {
  try {
    await Promise.all([connectDB(), redisClient.connect(), initPinecone()])
    console.log("Connected to db successfully.")
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
