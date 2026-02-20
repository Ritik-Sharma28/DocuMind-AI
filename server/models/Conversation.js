import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    sources: [
        {
            documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
            documentTitle: String,
            chunkText: String,
            score: Number,
        },
    ],
    timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, default: "New Conversation" },
        messages: [messageSchema],
        documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    },
    { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
