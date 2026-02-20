import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ChatMessage from "../components/ChatMessage";
import SourceCard from "../components/SourceCard";
import ReactMarkdown from "react-markdown";
import { FiSend, FiMessageSquare, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Chat() {
    const { id: paramId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState("");
    const [liveSources, setLiveSources] = useState([]);
    const [convos, setConvos] = useState([]);
    const [activeId, setActiveId] = useState(paramId || null);
    const [docs, setDocs] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [limits, setLimits] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const fetchLimits = () => api.get("/auth/limits").then((r) => setLimits(r.data)).catch(console.error);

    useEffect(() => {
        api.get("/chat/conversations").then((r) => setConvos(r.data.conversations));
        api.get("/documents").then((r) =>
            setDocs(r.data.documents.filter((d) => d.status === "completed"))
        );
        fetchLimits();
    }, []);

    useEffect(() => {
        if (activeId) {
            api.get(`/chat/conversations/${activeId}`).then((r) =>
                setMessages(r.data.conversation.messages)
            );
        }
    }, [activeId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streaming]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const q = input.trim();
        setInput("");
        setLoading(true);
        setStreaming("");
        setLiveSources([]);

        setMessages((p) => [...p, { role: "user", content: q }]);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question: q,
                    conversationId: activeId,
                    documentIds: selectedDocs,
                }),
            });

            if (res.status === 429) {
                const data = await res.json();
                toast.error("Limit today reached. Limits for next chat time in " + Math.ceil(data.resetInSeconds / 3600) + " hours.");
                setMessages((p) => p.slice(0, -1));
                setLoading(false);
                setStreaming("");
                setLiveSources([]);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let full = "";
            let sources = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder
                    .decode(value)
                    .split("\n")
                    .filter((l) => l.startsWith("data: "));

                for (const line of lines) {
                    try {
                        const d = JSON.parse(line.slice(6));
                        if (d.type === "sources") {
                            sources = d.sources;
                            setLiveSources(d.sources);
                            if (d.conversationId) setActiveId(d.conversationId);
                        } else if (d.type === "token") {
                            full += d.content;
                            setStreaming(full);
                        } else if (d.type === "done") {
                            setMessages((p) => [
                                ...p,
                                { role: "assistant", content: full, sources },
                            ]);
                            setStreaming("");
                            setLiveSources([]);
                            api.get("/chat/conversations").then((r) =>
                                setConvos(r.data.conversations)
                            );
                            fetchLimits();
                        } else if (d.type === "error") {
                            toast.error(d.message);
                        }
                    } catch { }
                }
            }
        } catch {
            toast.error("Failed to get response");
            setMessages((p) => p.slice(0, -1));
            setStreaming("");
            setLiveSources([]);
        }
        setLoading(false);
        inputRef.current?.focus();
    };

    const newChat = () => {
        setActiveId(null);
        setMessages([]);
        setStreaming("");
    };

    const deleteConvo = async (id) => {
        await api.delete(`/chat/conversations/${id}`);
        setConvos((p) => p.filter((c) => c._id !== id));
        if (activeId === id) newChat();
    };

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* ── Sidebar ── */}
            <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-4">
                    <button onClick={newChat} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2">
                        <FiMessageSquare /> New Chat
                    </button>
                </div>

                {limits && (
                    <div className="mx-4 mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-xs text-gray-400 mb-2 uppercase font-medium tracking-wider">Daily Limits</p>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">Chats</span>
                            <span className={`text-sm font-bold ${limits.chat.remaining === 0 ? "text-red-400" : "text-green-400"}`}>{limits.chat.remaining} / {limits.chat.limit}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">Uploads</span>
                            <span className={`text-sm font-bold ${limits.document.remaining === 0 ? "text-red-400" : "text-green-400"}`}>{limits.document.remaining} / {limits.document.limit}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-right">Resets in {Math.ceil(limits.resetInSeconds / 3600)}h</p>
                    </div>
                )}

                {/* Doc filter */}
                <div className="px-4 pb-3">
                    <p className="text-xs text-gray-500 uppercase mb-2">Filter by docs</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {docs.map((d) => (
                            <label key={d._id} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white">
                                <input type="checkbox" checked={selectedDocs.includes(d._id)}
                                    onChange={(e) => setSelectedDocs((p) => e.target.checked ? [...p, d._id] : p.filter((x) => x !== d._id))}
                                    className="rounded bg-gray-800 border-gray-700" />
                                <span className="truncate">{d.title}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <p className="text-xs text-gray-500 uppercase px-2 mb-2">History</p>
                    {convos.map((c) => (
                        <div key={c._id} onClick={() => setActiveId(c._id)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-1 ${activeId === c._id ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50"}`}>
                            <span className="text-sm truncate flex-1">{c.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteConvo(c._id); }}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400">
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Chat ── */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {messages.length === 0 && !streaming ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <span className="text-6xl mb-4">🧠</span>
                            <h2 className="text-2xl font-bold text-gray-300 mb-2">DocuMind AI</h2>
                            <p className="text-center max-w-md">
                                Ask questions about your uploaded documents. I'll find relevant
                                information and provide answers with source citations.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((m, i) => <ChatMessage key={i} message={m} />)}

                            {streaming && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">🧠</div>
                                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex-1">
                                        <div className="prose prose-invert max-w-none">
                                            <ReactMarkdown>{streaming}</ReactMarkdown>
                                        </div>
                                        <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-1" />
                                    </div>
                                </div>
                            )}

                            {liveSources.length > 0 && (
                                <div className="ml-11">
                                    <p className="text-xs text-gray-500 mb-2">Sources:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {liveSources.map((s, i) => <SourceCard key={i} source={s} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-800 px-4 py-4">
                    <div className="max-w-3xl mx-auto flex gap-3">
                        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                            placeholder="Ask about your documents…" disabled={loading}
                            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 placeholder-gray-500" />
                        <button onClick={send} disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50">
                            <FiSend />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
