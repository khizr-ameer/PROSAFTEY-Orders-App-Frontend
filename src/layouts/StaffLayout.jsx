import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, LogOut } from "lucide-react";
import Logo from "../assets/logo.png";

export default function StaffLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Nav item helper
  const navItem = (to, label, Icon) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors font-medium ${
        pathname === to
          ? "bg-black text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  // Final logout action
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  const LogoWithText = () => (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => navigate("/staff/dashboard")}
    >
      <img src={Logo} alt="PRO SAFETY Logo" className="w-10 h-10 object-contain" />
      <span className="text-2xl font-bold text-gray-900">PRO SAFETY</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-lg px-6 py-8 fixed top-0 bottom-0 left-0">
        <LogoWithText />

        <nav className="space-y-3 flex-1 overflow-y-auto mt-10">
          {navItem("/staff/dashboard", "Dashboard", LayoutDashboard)}
          {navItem("/profile", "My Profile", User)}
          {navItem("/staff/clients", "Clients", Users)}
          {/* Staff-only, removed Staff nav */}
        </nav>

        {/* Logout */}
        <div className="mt-auto w-full">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between bg-white p-4 border-b shadow-md fixed top-0 left-0 right-0 z-10">
        <LogoWithText />
        <button
          className="text-black text-2xl font-bold"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 w-64 bg-white h-full p-6 shadow-lg z-30 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <LogoWithText />

            <nav className="space-y-3 flex-1 overflow-y-auto mt-10">
              {navItem("/staff/dashboard", "Dashboard", LayoutDashboard)}
              {navItem("/profile", "My Profile", User)}
              {navItem("/staff/clients", "Clients", Users)}
              {/* Staff-only, removed Staff nav */}
            </nav>

            <div className="mt-auto w-full">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 md:ml-64 mt-16 md:mt-0 overflow-auto min-h-screen">
        {children}
      </main>

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
    </div>
  );
}
