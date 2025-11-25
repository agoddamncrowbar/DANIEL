import { useState } from "react";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);

      // If backend returns a token (if you add auto-login)
      if (res.data?.access_token) {
        await login(res.data.access_token);
        navigate("/");
        return;
      }

      // Otherwise redirect to login
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleSignup}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
        >
          <h2 className="text-2xl font-semibold text-center mb-6">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border rounded focus:outline-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border rounded focus:outline-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              className="w-full p-2 border rounded focus:outline-blue-500"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-2 border rounded focus:outline-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded"
          >
            Sign Up
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
}
