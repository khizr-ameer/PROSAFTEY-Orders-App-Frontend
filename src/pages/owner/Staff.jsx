import { useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import { Trash2, Eye, EyeOff, UserPlus, Users, Mail, Shield, Lock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function Staff() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* =============================
     CREATE STAFF MODAL
  ============================== */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  /* =============================
     RESET PASSWORD MODAL
  ============================== */
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =============================
     DELETE CONFIRMATION MODAL
  ============================== */
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* =============================
     FETCH STAFF
  ============================== */
  const fetchStaff = async () => {
    try {
      const res = await axios.get("/auth/getstaff");
      setStaff(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  /* =============================
     CREATE STAFF
  ============================== */
  const handleCreateStaff = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/auth/staff", createForm);
      alert("Staff created successfully");
      setShowCreateModal(false);
      setCreateForm({ email: "", password: "" });
      setShowCreatePassword(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create staff");
    }
  };

  /* =============================
     RESET PASSWORD
  ============================== */
  const openResetModal = (member) => {
    setSelectedStaff(member);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowResetModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.patch(`/auth/reset-password/${selectedStaff._id}`, {
        newPassword: passwordForm.newPassword,
      });

      alert("Password reset successfully");
      setShowResetModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  /* =============================
     DELETE STAFF
  ============================== */
  const openDeleteModal = (member) => {
    setSelectedStaff(member);
    setShowDeleteModal(true);
  };

  const handleDeleteStaff = async () => {
    try {
      await axios.delete(`/auth/staff/${selectedStaff._id}`);
      setStaff(staff.filter((s) => s._id !== selectedStaff._id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete staff");
    }
  };

  const filteredStaff = staff.filter((member) =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-500 mt-1">Manage your team members and permissions</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <UserPlus size={20} />
              Add Staff
            </button>
          </div>

          {/* Search Bar */}
          {staff.length > 0 && (
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search staff by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading staff...</p>
            </div>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No staff members yet</h3>
              <p className="text-gray-500 mb-6">Add your first staff member to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all inline-flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add Your First Staff
              </button>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">No staff members match your search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStaff.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-gray-300"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Staff Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-semibold text-gray-900 mb-1 break-all">{member.email}</h2>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-900 text-white text-xs font-semibold">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => openResetModal(member)}
                        className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Lock size={16} />
                        Reset Password
                      </button>
                      <button
                        onClick={() => openDeleteModal(member)}
                        className="sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && staff.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredStaff.length} of {staff.length} staff member{staff.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* CREATE STAFF MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create Staff Member</h2>
                  <p className="text-gray-300 text-sm">Add a new team member</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="staff@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    placeholder="Enter temporary password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCreatePassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-semibold transition-all shadow-lg"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                  <p className="text-gray-300 text-sm truncate">{selectedStaff?.email}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-semibold transition-all shadow-lg"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Delete Staff Member</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-900">{selectedStaff?.email}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg shadow-red-500/30"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}