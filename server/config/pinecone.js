import { Pinecone } from "@pinecone-database/pinecone";

let pineconeIndex;

export const initPinecone = async () => {
    const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    pineconeIndex = client.index(process.env.PINECONE_INDEX_NAME);
    console.log("✅  Pinecone initialized");
};

export const getPineconeIndex = () => pineconeIndex;
