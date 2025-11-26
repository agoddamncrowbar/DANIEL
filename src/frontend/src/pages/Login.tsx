import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Animation state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const token = res.data.access_token;

      if (!token) {
        setError("No token received");
        return;
      }

      await login(token);

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <>
      <Header />

      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <form
          onSubmit={handleLogin}
          className={`
            bg-white p-8 w-full max-w-sm border border-gray-200 
            transition-all duration-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ borderRadius: "0px" }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-brand-black">
            Login
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 border border-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 focus:border-brand-green focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 focus:border-brand-green focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-green text-white bg-black py-2 font-semibold transition-all duration-200 hover:bg-[#B8860B]"
            style={{ borderRadius: "0px" }}
          >
            Login
          </button>

          <p className="text-center text-sm mt-4 text-gray-700">
            Don’t have an account?{" "}
            <a href="/signup" className="text-brand-green hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>

      <Footer />
    </>
  );
}
