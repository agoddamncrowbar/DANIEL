"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", { email, password });
            login(res.data.access_token, res.data.user);
            router.push("/listings");
        } catch (err: any) {
            const detail = err.response?.data?.detail;

            if (Array.isArray(detail)) {
                // FastAPI validation errors (array of objects)
                setError(detail.map((d: any) => d.msg).join(", "));
            } else if (typeof detail === "string") {
                setError(detail);
            } else {
                setError("Login failed");
            }
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded-xl shadow-md w-96"
        >
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}

            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Login
            </button>
        </form>
        </div>
    );
}
