import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../api/axios";
import { FiUploadCloud, FiFile, FiX, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Upload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const [limits, setLimits] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/auth/limits").then((r) => setLimits(r.data)).catch(console.error);
    }, []);

    const onDrop = useCallback((f) => {
        if (f[0]) { setFile(f[0]); setTitle(f[0].name.replace(/\.[^/.]+$/, "")); }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, maxFiles: 1, maxSize: 10 * 1024 * 1024,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "text/plain": [".txt"],
            "text/markdown": [".md"],
        },
    });

    const upload = async () => {
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title || file.name);
        try {
            await api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setDone(true);
            toast.success("Document uploaded! Processing started.");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            if (err.response?.status === 429) {
                toast.error("Limit today reached. Limits for next upload time in " + Math.ceil(err.response.data.resetInSeconds / 3600) + " hours.");
            } else {
                toast.error("oops u bro added currupt pdf like ... we arent rich to afford paid api .. limit hits");
            }
        }
        setUploading(false);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 sm:relative">
            {limits && (
                <div className="mb-4 sm:mb-0 sm:absolute sm:top-0 sm:right-4 bg-gray-900 border border-gray-800 p-3 rounded-xl shadow-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Upload Limits</p>
                    <div className="flex gap-2 items-center">
                        <span className={`font-bold ${limits.document.remaining === 0 ? "text-red-400" : "text-green-400"}`}>
                            {limits.document.remaining} / {limits.document.limit}
                        </span>
                        <span className="text-sm text-gray-400">remaining</span>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-2 pt-4">Upload Document</h1>
            <p className="text-gray-400 mb-8">PDF, DOCX, TXT, or MD — up to 10 MB</p>

            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-600 bg-gray-900"}`}>
                <input {...getInputProps()} />
                <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-300">{isDragActive ? "Drop here…" : "Drag & drop or click to select"}</p>
            </div>

            {file && (
                <div className="mt-6 bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FiFile className="text-blue-400" />
                            <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => { setFile(null); setTitle(""); }} className="text-gray-400 hover:text-red-400"><FiX /></button>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>

                    <button onClick={upload} disabled={uploading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                        {uploading ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" /> Processing…</> : done ? <><FiCheck /> Uploaded!</> : <><FiUploadCloud /> Upload & Process</>}
                    </button>
                </div>
            )}
        </div>
    );
}
