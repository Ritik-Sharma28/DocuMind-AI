import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const Ctx = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        if (t && u) setUser(JSON.parse(u));
        setReady(true);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    };

    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout error", err);
        }
        localStorage.clear();
        setUser(null);
    };

    if (!ready) return null;

    return (
        <Ctx.Provider value={{ user, login, register, logout }}>
            {children}
        </Ctx.Provider>
    );
}

export const useAuth = () => useContext(Ctx);
