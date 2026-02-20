import ReactMarkdown from "react-markdown";
import SourceCard from "./SourceCard";
import { FiUser } from "react-icons/fi";

export default function ChatMessage({ message: msg }) {
    const isUser = msg.role === "user";
    return (
        <div className="space-y-2">
            <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUser ? "bg-blue-600" : "bg-purple-600"}`}>
                    {isUser ? <FiUser size={16} /> : "🧠"}
                </div>
                <div className={`rounded-xl p-4 flex-1 ${isUser ? "bg-blue-600/20 border border-blue-500/30" : "bg-gray-900 border border-gray-800"}`}>
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                </div>
            </div>
            {msg.sources?.length > 0 && (
                <div className="ml-11">
                    <p className="text-xs text-gray-500 mb-2">📎 Sources:</p>
                    <div className="flex flex-wrap gap-2">
                        {msg.sources.map((s, i) => <SourceCard key={i} source={s} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
