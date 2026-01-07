import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "../api/axios";
import Logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "OWNER") navigate("/owner/dashboard");
      else if (role === "STAFF") navigate("/staff/dashboard");
      else navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Server error. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-gray-50 to-gray-100 relative overflow-hidden px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Login Card */}
      <div
        className="
          w-full max-w-md bg-white rounded-3xl shadow-2xl
          px-8 py-10 sm:px-10 sm:py-12
          min-h-[540px] sm:min-h-[580px]
          flex flex-col justify-center
          relative z-10
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={Logo}
            alt="Factory Logo"
            className="w-52 h-20 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-center">
          Welcome back
        </h1>
        <p className="text-gray-500 mb-8 text-sm sm:text-base text-center">
          Sign in to your factory system
        </p>

        {error && (
          <p className="text-red-500 mb-4 text-center text-sm">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full border border-gray-300 rounded-xl
              px-4 py-3
              focus:outline-none focus:border-black
              text-sm sm:text-base transition
            "
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full border border-gray-300 rounded-xl
                px-4 py-3 pr-12
                focus:outline-none focus:border-black
                text-sm sm:text-base transition
              "
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full bg-black text-white py-3 rounded-xl
              text-base sm:text-lg
              transition-transform
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}
            `}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}
      </style>
    </div>
  );
}
