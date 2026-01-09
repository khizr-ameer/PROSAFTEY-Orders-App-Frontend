import { useState, useEffect } from "react";
import OwnerLayout from "../layouts/OwnerLayout";
import StaffLayout from "../layouts/StaffLayout";
import { LogOut, Eye, EyeOff } from "lucide-react";
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
    return <div className="p-4">Loading user info...</div>;
  }

  // =========================
  // Choose Layout based on TOKEN role
  // =========================
  const LayoutWrapper =
    roleFromToken === "OWNER" ? OwnerLayout : StaffLayout;

  return (
    <LayoutWrapper>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold">My Profile</h1>

        {/* User Info */}
        <div className="bg-white rounded-3xl p-6 shadow-md space-y-3">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-lg font-medium">{user.role || "N/A"}</p>
          </div>
        </div>

        {/* Change Password */}
        <form
          onSubmit={handlePasswordChange}
          className="bg-white rounded-3xl p-6 shadow-md space-y-4"
        >
          <h2 className="text-xl font-semibold">Change Password</h2>

          {/* Old Password */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="Old Password"
              required
              className="w-full border rounded-xl px-4 py-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New Password"
              required
              className="w-full border rounded-xl px-4 py-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm New Password"
              required
              className="w-full border rounded-xl px-4 py-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 space-y-4">
            <h2 className="text-lg font-semibold">Confirm Logout</h2>
            <p className="text-gray-600 text-sm">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
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
