import { useState, useEffect } from "react";
import OwnerLayout from "../layouts/OwnerLayout";
import StaffLayout from "../layouts/StaffLayout";
import { LogOut, Eye, EyeOff, User, Mail, Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ email: "", role: "" });
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // =========================
  // Get role DIRECTLY from token (for layout)
  // =========================
  const token = localStorage.getItem("token");

  let roleFromToken = "";
  if (token) {
    try {
      roleFromToken = jwtDecode(token)?.role || "";
    } catch {
      roleFromToken = "";
    }
  }

  // =========================
  // Fetch logged-in user info
  // =========================
  useEffect(() => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.clear();
      navigate("/");
      return;
    }

    setUser((prev) => ({ ...prev, role: decoded?.role || "" }));

    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setUser({
          email: res.data?.email || "",
          role: res.data?.role || decoded?.role || "",
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [navigate, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.patch("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      alert("Password updated successfully");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Final logout action
  const confirmLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading user info...</p>
        </div>
      </div>
    );
  }

  // =========================
  // Choose Layout based on TOKEN role
  // =========================
  const LayoutWrapper =
    roleFromToken === "OWNER" ? OwnerLayout : StaffLayout;

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and security</p>
        </div>

        <div className="grid gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                  <p className="text-sm text-gray-500">Your personal details</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{user.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                  <Shield className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-900 text-white text-sm font-semibold">
                      {user.role || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6">
              <div className="space-y-4">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      name="oldPassword"
                      value={form.oldPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 font-semibold text-white py-3 rounded-xl transition-all shadow-lg mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Logout</h3>
                <p className="text-sm text-gray-500 mt-1">Sign out of your account</p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Confirm Logout</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Are you sure you want to logout? You'll need to sign in again to access your account.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg shadow-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}