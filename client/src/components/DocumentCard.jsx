import { FiFileText, FiTrash2, FiCheck, FiLoader, FiAlertCircle } from "react-icons/fi";

const STATUS = {
    processing: { icon: <FiLoader className="animate-spin" />, color: "text-yellow-400" },
    completed: { icon: <FiCheck />, color: "text-green-400" },
    failed: { icon: <FiAlertCircle />, color: "text-red-400" },
};

const fmtSize = (b) =>
    b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

export default function DocumentCard({ document: doc, onDelete }) {
    const s = STATUS[doc.status];
    return (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg"><FiFileText className="text-blue-400" /></div>
                    <div>
                        <h3 className="font-medium truncate max-w-[200px]">{doc.title}</h3>
                        <p className="text-xs text-gray-500">{doc.fileName}</p>
                    </div>
                </div>
                <button onClick={() => onDelete(doc._id)} className="text-gray-500 hover:text-red-400">
                    <FiTrash2 />
                </button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex gap-4 text-gray-400">
                    <span>{fmtSize(doc.fileSize)}</span>
                    <span>{doc.totalChunks} chunks</span>
                </div>
                <div className={`flex items-center gap-1 ${s.color}`}>
                    {s.icon} <span className="text-xs capitalize">{doc.status}</span>
                </div>
            </div>
        </div>
    );
}
