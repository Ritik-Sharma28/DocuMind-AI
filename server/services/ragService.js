import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { EmbeddingService } from "./embeddingService.js";

// ── RAG Prompt with source-citation instruction ──
const RAG_PROMPT = PromptTemplate.fromTemplate(`
You are DocuMind AI, an intelligent document assistant.
Answer the user's question based ONLY on the provided context.
If the context does not contain enough information, say so honestly.
Always cite which document the information comes from using [Source N] tags.

─── Context from user's documents ───
{context}

─── Conversation history (for follow-ups) ───
{history}

─── Current question ───
{question}

Provide a clear, well-structured answer with citations:`);

let chain = null;
const getChain = () => {
    if (!chain) {
        const llm = new ChatGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "gemini-2.5-flash-lite",
            temperature: 0.3,
            maxOutputTokens: 2048,
        });
        chain = RunnableSequence.from([RAG_PROMPT, llm, new StringOutputParser()]);
    }
    return chain;
};

export class RAGService {
    /**
     * Standard (non-streaming) RAG query.
     */
    static async query(question, userId, history = [], documentIds = []) {
        const chunks = await EmbeddingService.queryVectors(
            question,
            userId,
            5,
            documentIds
        );

        if (!chunks.length)
            return {
                answer:
                    "I couldn't find relevant information in your documents. " +
                    "Please upload documents related to your question.",
                sources: [],
            };

        const context = chunks
            .map((c, i) => `[Source ${i + 1}: "${c.documentTitle}"]\n${c.text}`)
            .join("\n\n---\n\n");

        const historyStr =
            history
                .slice(-6)
                .map((m) => `${m.role}: ${m.content}`)
                .join("\n") || "No previous conversation.";

        const answer = await getChain().invoke({
            context,
            history: historyStr,
            question,
        });

        return {
            answer,
            sources: chunks.map((c) => ({
                documentId: c.documentId,
                documentTitle: c.documentTitle,
                chunkText: c.text.substring(0, 200) + "…",
                score: Math.round(c.score * 100) / 100,
            })),
        };
    }

    /**
     * Streaming RAG query — returns an async iterable of tokens.
     */
    static async queryStream(question, userId, history = [], documentIds = []) {
        const chunks = await EmbeddingService.queryVectors(
            question,
            userId,
            5,
            documentIds
        );

        if (!chunks.length)
            return {
                stream: null,
                answer:
                    "I couldn't find relevant information in your documents.",
                sources: [],
            };

        const context = chunks
            .map((c, i) => `[Source ${i + 1}: "${c.documentTitle}"]\n${c.text}`)
            .join("\n\n---\n\n");

        const historyStr =
            history
                .slice(-6)
                .map((m) => `${m.role}: ${m.content}`)
                .join("\n") || "No previous conversation.";

        const stream = await getChain().stream({
            context,
            history: historyStr,
            question,
        });

        const sources = chunks.map((c) => ({
            documentId: c.documentId,
            documentTitle: c.documentTitle,
            chunkText: c.text.substring(0, 200) + "…",
            score: Math.round(c.score * 100) / 100,
        }));

        return { stream, sources };
    }
}
