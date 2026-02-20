import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getPineconeIndex } from "../config/pinecone.js";
import { v4 as uuidv4 } from "uuid";

let embeddings = null;
const getEmbeddings = () => {
    if (!embeddings) {
        embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-embedding-001", 
        });
    }
    return embeddings;
};

export class EmbeddingService {

    static async embedAndStore(chunks, documentId, userId, documentTitle) {
        const index = getPineconeIndex();
        const namespace = `user_${userId}`;
        const BATCH = 100;

        for (let i = 0; i < chunks.length; i += BATCH) {
            const batch = chunks.slice(i, i + BATCH);
            const texts = batch.map((c) => c.text);

            const vectors = await getEmbeddings().embedDocuments(texts);

            const records = batch.map((chunk, idx) => ({
                id: uuidv4(),
                values: vectors[idx],
                metadata: {
                    text: chunk.text,
                    chunkIndex: chunk.index,
                    documentId: documentId.toString(),
                    documentTitle,
                    userId: userId.toString(),
                },
            }));

            await index.namespace(namespace).upsert(records);
        }

        return { totalEmbedded: chunks.length, namespace };
    }

    /**
     * Semantic similarity search.
     * Optionally filter by specific document IDs.
     */
    static async queryVectors(queryText, userId, topK = 5, documentIds = []) {
        const index = getPineconeIndex();
        const namespace = `user_${userId}`;

        const queryVector = await getEmbeddings().embedQuery(queryText);

        const filter = { userId: userId.toString() };
        if (documentIds.length > 0) {
            filter.documentId = { $in: documentIds.map(String) };
        }

        const { matches } = await index.namespace(namespace).query({
            vector: queryVector,
            topK,
            includeMetadata: true,
            filter,
        });

        return matches.map((m) => ({
            text: m.metadata.text,
            score: m.score,
            documentId: m.metadata.documentId,
            documentTitle: m.metadata.documentTitle,
            chunkIndex: m.metadata.chunkIndex,
        }));
    }

    static async deleteDocumentVectors(documentId, userId) {
        const index = getPineconeIndex();
        const namespace = `user_${userId}`;

        await index.namespace(namespace).deleteMany({
            documentId: documentId.toString(),
        });
    }
}
