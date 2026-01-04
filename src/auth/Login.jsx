import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token, role } = response.data;

      // Store JWT and role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === "OWNER") {
        navigate("/owner/dashboard");
      } else if (role === "STAFF") {
        navigate("/staff/dashboard");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Server error. Try again later.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Sign in to your factory system
        </p>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black text-sm sm:text-base"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black text-sm sm:text-base"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black text-white py-3 rounded-xl text-base sm:text-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
