import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await register(name, email, password); toast.success("Account created!"); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-5xl">🧠</span>
                    <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        DocuMind AI
                    </h1>
                </div>
                <form onSubmit={submit} className="bg-gray-900 rounded-xl p-8 border border-gray-800 space-y-4">
                    <h2 className="text-xl font-semibold">Create Account</h2>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500" />
                    <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
                        {loading ? "Creating…" : "Create Account"}
                    </button>
                    <p className="text-center text-gray-400 text-sm">
                        Have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
