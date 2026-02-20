import Conversation from "../models/Conversation.js";
import { RAGService } from "../services/ragService.js";

export const chat = async (req, res) => {
    try {
        const { question, conversationId, documentIds } = req.body;
        if (!question?.trim())
            return res.status(400).json({ message: "Question is required" });

        let convo = conversationId
            ? await Conversation.findOne({ _id: conversationId, user: req.user._id })
            : null;

        if (!convo) {
            convo = await Conversation.create({
                user: req.user._id,
                title: question.substring(0, 50) + (question.length > 50 ? "…" : ""),
                documentIds: documentIds || [],
            });
        }

        convo.messages.push({ role: "user", content: question });

        const { answer, sources } = await RAGService.query(
            question,
            req.user._id,
            convo.messages.slice(-6),
            documentIds || []
        );

        convo.messages.push({ role: "assistant", content: answer, sources });
        await convo.save();

        res.json({ conversationId: convo._id, answer, sources });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Server-Sent Events streaming endpoint.
 * Sends tokens in real-time as the LLM generates them.
 */
export const chatStream = async (req, res) => {
    try {
        const { question, conversationId, documentIds } = req.body;
        if (!question?.trim())
            return res.status(400).json({ message: "Question is required" });

        let convo = conversationId
            ? await Conversation.findOne({ _id: conversationId, user: req.user._id })
            : null;

        if (!convo) {
            convo = await Conversation.create({
                user: req.user._id,
                title: question.substring(0, 50) + (question.length > 50 ? "…" : ""),
                documentIds: documentIds || [],
            });
        }

        convo.messages.push({ role: "user", content: question });

        // ── SSE headers ──
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });

        const { stream, sources } = await RAGService.queryStream(
            question,
            req.user._id,
            convo.messages.slice(-6),
            documentIds || []
        );

        if (!stream) {
            const msg = "I couldn't find relevant information in your documents.";
            res.write(`data: ${JSON.stringify({ type: "token", content: msg })}\n\n`);
            res.write(`data: ${JSON.stringify({ type: "done", sources: [] })}\n\n`);
            convo.messages.push({ role: "assistant", content: msg, sources: [] });
            await convo.save();
            return res.end();
        }

        // Send sources immediately so the UI can show them
        res.write(
            `data: ${JSON.stringify({
                type: "sources",
                sources,
                conversationId: convo._id,
            })}\n\n`
        );

        // Stream each token
        let full = "";
        for await (const chunk of stream) {
            full += chunk;
            res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);

        convo.messages.push({ role: "assistant", content: full, sources });
        await convo.save();

        res.end();
    } catch (err) {
        res.write(
            `data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`
        );
        res.end();
    }
};

export const getConversations = async (req, res) => {
    const conversations = await Conversation.find({ user: req.user._id })
        .select("title createdAt updatedAt messages")
        .sort({ updatedAt: -1 });

    res.json({
        conversations: conversations.map((c) => ({
            _id: c._id,
            title: c.title,
            messageCount: c.messages.length,
            lastMessage: c.messages.at(-1)?.content?.substring(0, 100),
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        })),
    });
};

export const getConversation = async (req, res) => {
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!conversation)
        return res.status(404).json({ message: "Conversation not found" });
    res.json({ conversation });
};

export const deleteConversation = async (req, res) => {
    const conversation = await Conversation.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!conversation)
        return res.status(404).json({ message: "Conversation not found" });
    res.json({ message: "Conversation deleted" });
};
