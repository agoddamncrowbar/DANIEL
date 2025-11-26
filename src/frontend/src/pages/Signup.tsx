import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Mount animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);

      if (res.data?.access_token) {
        await login(res.data.access_token);
        navigate("/");
        return;
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <>
      <Header />

      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <form
          onSubmit={handleSignup}
          className={`
            bg-white p-8 w-full max-w-sm border border-gray-200
            transition-all duration-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ borderRadius: "0px" }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-brand-black">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-2 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border border-gray-300 focus:border-brand-green focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0px" }}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border border-gray-300 focus:border-brand-green focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0px" }}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              className="w-full p-2 border border-gray-300 focus:border-brand-green focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0px" }}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full p-2 border border-gray-300 focus:border-brand-green focus:outline-none transition-all duration-200"
              style={{ borderRadius: "0px" }}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-brand-green text-white bg-black py-2 font-semibold transition-all duration-200 hover:bg-[#B8860B]"
            style={{ borderRadius: "0px" }}
          >
            Sign Up
          </button>

          <p className="text-center text-sm mt-4 text-gray-700">
            Already have an account?{" "}
            <a href="/login" className="text-brand-green hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>

      <Footer />
    </>
  );
}
