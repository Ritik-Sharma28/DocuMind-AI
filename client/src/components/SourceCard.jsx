import { useState } from "react";
import { FiFileText, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function SourceCard({ source }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg text-sm">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-800 rounded-lg"
            >
                <FiFileText className="text-blue-400 shrink-0" size={14} />
                <span className="text-gray-300 truncate">{source.documentTitle}</span>
                <span className="text-xs text-gray-500 shrink-0">
                    {Math.round(source.score * 100)}%
                </span>
                {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
            {open && (
                <p className="px-3 pb-3 text-xs text-gray-400 leading-relaxed border-t border-gray-700 pt-2">
                    {source.chunkText}
                </p>
            )}
        </div>
    );
}
