import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true },
        fileName: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        totalChunks: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["processing", "completed", "failed"],
            default: "processing",
        },
        pineconeNamespace: { type: String, required: true },
        metadata: {
            pageCount: Number,
            wordCount: Number,
            charCount: Number,
        },
        errorMessage: String,
    },
    { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
