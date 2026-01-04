import { useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function Staff() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =============================
     CREATE STAFF MODAL
  ============================== */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
  });

  /* =============================
     RESET PASSWORD MODAL
  ============================== */
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

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

  return (
    <OwnerLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Staff</h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          + Add Staff
        </button>
      </div>

      {/* STAFF LIST */}
      {loading ? (
        <p className="text-gray-500">Loading staff...</p>
      ) : staff.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow-md text-center">
          <p className="text-gray-500">
            No staff members found. Use the “Add Staff” button above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {staff.map((member) => (
            <div
              key={member._id}
              className="bg-white p-6 rounded-3xl shadow-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{member.email}</h2>
                <p className="text-gray-500">{member.role}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openResetModal(member)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                >
                  Reset Password
                </button>

                <button
                  onClick={() => openDeleteModal(member)}
                  className="p-2 rounded-xl hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create Staff</h2>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <input
                type="password"
                placeholder="Temporary Password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Reset Password – {selectedStaff.email}
            </h2>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Delete Staff</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedStaff.email}</strong>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                className="px-4 py-2 rounded-xl bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
