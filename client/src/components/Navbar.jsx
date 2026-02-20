import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiHome, FiUpload, FiMessageSquare, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const links = [
    { to: "/", label: "Dashboard", icon: <FiHome /> },
    { to: "/upload", label: "Upload", icon: <FiUpload /> },
    { to: "/chat", label: "Chat", icon: <FiMessageSquare /> },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        DocuMind AI
                    </span>
                </div>

                {/* Desktop nav links */}
                <div className="hidden md:flex gap-1">
                    {links.map((l) => (
                        <Link
                            key={l.to}
                            to={l.to}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${pathname === l.to
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {l.icon} <span>{l.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Desktop user section */}
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-sm text-gray-400">{user?.name}</span>
                    <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-sm">
                        <FiLogOut /> Logout
                    </button>
                </div>

                {/* Mobile hamburger button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-gray-400 hover:text-white p-2"
                >
                    {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 pb-4 pt-2 space-y-1">
                    {links.map((l) => (
                        <Link
                            key={l.to}
                            to={l.to}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${pathname === l.to
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {l.icon} <span>{l.label}</span>
                        </Link>
                    ))}
                    <div className="border-t border-gray-800 pt-3 mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-400">{user?.name}</span>
                        <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-sm">
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
