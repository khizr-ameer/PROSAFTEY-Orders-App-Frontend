import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, Users, LogOut, X, Menu } from "lucide-react";
import Logo from "../assets/logo.png";

export default function OwnerLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Nav item helper
  const navItem = (to, label, Icon) => {
    const isActive = pathname === to || pathname.startsWith(to + "/");
    
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group relative ${
          isActive
            ? "bg-black text-white shadow-lg"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
        <span>{label}</span>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full -ml-6"></div>
        )}
      </Link>
    );
  };

  // Final logout action
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  const LogoWithText = () => (
    <div
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => navigate("/owner/dashboard")}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <img src={Logo} alt="PRO SAFETY Logo" className="w-8 h-8 object-contain" />
      </div>
      <div>
        <span className="text-xl font-bold text-gray-900 block leading-tight">
          PRO SAFETY
        </span>
        <span className="text-xs text-gray-500 font-medium">Owner Portal</span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 shadow-sm px-6 py-8 fixed top-0 bottom-0 left-0">
        <LogoWithText />

        <nav className="space-y-2 flex-1 overflow-y-auto mt-10">
          {navItem("/owner/dashboard", "Dashboard", LayoutDashboard)}
          {navItem("/owner/clients", "Clients", Users)}
          {navItem("/owner/staff", "Staff", Users)}
          {navItem("/profile", "My Profile", User)}
        </nav>

        {/* Logout */}
        <div className="mt-auto w-full pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between bg-white px-4 py-4 border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-40">
        <LogoWithText />
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={24} className="text-gray-900" />
          ) : (
            <Menu size={24} className="text-gray-900" />
          )}
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed left-0 top-0 w-72 bg-white h-full shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <LogoWithText />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-900" />
            </button>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto p-6">
          {navItem("/owner/dashboard", "Dashboard", LayoutDashboard)}
          {navItem("/owner/clients", "Clients", Users)}
          {navItem("/owner/staff", "Staff", Users)}
          {navItem("/profile", "My Profile", User)}
        </nav>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setShowLogoutConfirm(true);
            }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-72 mt-20 md:mt-0 overflow-auto min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

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
    </div>
  );
}