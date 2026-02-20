import Document from "../models/Document.js";
import { DocumentProcessor } from "../services/documentProcessor.js";
import { EmbeddingService } from "../services/embeddingService.js";
import { TextChunker } from "../utils/chunker.js";

// ── Async processing pipeline ──
async function processDocument(doc, buffer, userId) {
    const { text, metadata } = await DocumentProcessor.extractText(
        buffer,
        doc.fileName
    );
    doc.metadata = metadata;

    const chunks = new TextChunker({
        chunkSize: 1000,
        chunkOverlap: 200,
    }).splitText(text);
    doc.totalChunks = chunks.length;

    await EmbeddingService.embedAndStore(chunks, doc._id, userId, doc.title);

    doc.status = "completed";
    await doc.save();
}

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        const { originalname, buffer, size, mimetype } = req.file;

        const doc = await Document.create({
            user: req.user._id,
            title: req.body.title || originalname,
            fileName: originalname,
            fileType: mimetype,
            fileSize: size,
            pineconeNamespace: `user_${req.user._id}`,
        });

        // Fire-and-forget processing
        processDocument(doc, buffer, req.user._id).catch(async (err) => {
            doc.status = "failed";
            doc.errorMessage = err.message;
            await doc.save();
        });

        res.status(201).json({ message: "Processing started", document: doc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDocuments = async (req, res) => {
    const documents = await Document.find({ user: req.user._id }).sort({
        createdAt: -1,
    });
    res.json({ documents });
};

export const getDocument = async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!document)
        return res.status(404).json({ message: "Document not found" });
    res.json({ document });
};

export const deleteDocument = async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!document)
        return res.status(404).json({ message: "Document not found" });

    await EmbeddingService.deleteDocumentVectors(document._id, req.user._id);
    await document.deleteOne();

    res.json({ message: "Document deleted" });
};

export const getStats = async (req, res) => {
    const uid = req.user._id;
    const [totalDocuments, completedDocuments, agg] = await Promise.all([
        Document.countDocuments({ user: uid }),
        Document.countDocuments({ user: uid, status: "completed" }),
        Document.aggregate([
            { $match: { user: uid } },
            { $group: { _id: null, total: { $sum: "$totalChunks" } } },
        ]),
    ]);
    res.json({
        totalDocuments,
        completedDocuments,
        totalChunks: agg[0]?.total || 0,
    });
};
