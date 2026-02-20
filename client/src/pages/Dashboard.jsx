import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import DocumentCard from "../components/DocumentCard";
import { FiUpload, FiMessageSquare, FiFileText, FiDatabase } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Dashboard() {
    const { user } = useAuth();
    const [docs, setDocs] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get("/documents"), api.get("/documents/stats")])
            .then(([d, s]) => { setDocs(d.data.documents); setStats(s.data); })
            .catch(() => toast.error("Failed to load"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this document and its embeddings?")) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocs((p) => p.filter((d) => d._id !== id));
            toast.success("Deleted");
        } catch { toast.error("Delete failed"); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500" />
        </div>
    );

    const statCards = [
        { label: "Documents", value: stats.totalDocuments || 0, icon: <FiFileText />, color: "blue" },
        { label: "Knowledge Chunks", value: stats.totalChunks || 0, icon: <FiDatabase />, color: "green" },
        { label: "Ready to Query", value: stats.completedDocuments || 0, icon: <FiMessageSquare />, color: "purple" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome back, {user?.name} 👋</h1>
            <p className="text-gray-400 mb-8">Manage your documents and ask questions</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {statCards.map((s) => (
                    <div key={s.label} className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex items-center gap-4">
                        <div className={`p-3 bg-${s.color}-500/20 rounded-lg text-${s.color}-400 text-xl`}>{s.icon}</div>
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-sm text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <Link to="/upload" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg">
                    <FiUpload /> Upload Document
                </Link>
                <Link to="/chat" className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700">
                    <FiMessageSquare /> Start Chat
                </Link>
            </div>

            <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
            {docs.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                    <FiFileText className="mx-auto text-4xl text-gray-600 mb-4" />
                    <p className="text-gray-400">No documents yet. Upload your first!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map((d) => <DocumentCard key={d._id} document={d} onDelete={handleDelete} />)}
                </div>
            )}
        </div>
    );
}
