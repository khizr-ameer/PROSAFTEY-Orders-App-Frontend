import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients");
      setClients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const toggleSelect = (id) => {
    setSelectedClients((prev) =>
      prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedClients.length === 0) return alert("Select at least one client");

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedClients.length} client(s)?`
    );
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedClients.map((id) => axios.delete(`/clients/${id}`))
      );
      alert("Selected clients deleted successfully");
      setClients(clients.filter((c) => !selectedClients.includes(c._id)));
      setSelectedClients([]);
      setDeleteMode(false);
    } catch (err) {
      console.error("Failed to delete clients:", err);
      alert(err.response?.data?.message || "Failed to delete clients");
    }
  };

  const handleCancelDelete = () => {
    setSelectedClients([]);
    setDeleteMode(false);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-500 mt-1">Manage your client relationships</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!deleteMode && (
                <button
                  className="bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2"
                  onClick={() => navigate("/owner/clients/create")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Client
                </button>
              )}

              {clients.length > 0 && !deleteMode && (
                <button
                  className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-200"
                  onClick={() => setDeleteMode(true)}
                >
                  Delete Clients
                </button>
              )}

              {deleteMode && (
                <>
                  <button
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
                    onClick={handleDeleteSelected}
                  >
                    Delete ({selectedClients.length})
                  </button>
                  <button
                    className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {clients.length > 0 && (
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search clients by name or email..."
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
              <p className="text-gray-500 font-medium">Loading clients...</p>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first client</p>
              <button
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all inline-flex items-center gap-2"
                onClick={() => navigate("/owner/clients/create")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Client
              </button>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">No clients match your search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border ${
                  deleteMode && selectedClients.includes(client._id)
                    ? "border-red-500 bg-red-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Checkbox */}
                    {deleteMode && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client._id)}
                          onChange={() => toggleSelect(client._id)}
                          className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Client Info */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (deleteMode) toggleSelect(client._id);
                        else navigate(`/owner/clients/${client._id}`);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-semibold text-gray-900 mb-1">{client.name}</h2>
                          <p className="text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!deleteMode && (
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          className="flex-1 sm:flex-none bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2"
                          onClick={() =>
                            navigate(`/owner/clients/${client._id}/sample-orders`)
                          }
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Samples
                        </button>
                        <button
                          className="flex-1 sm:flex-none bg-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-900 transition-all text-sm flex items-center justify-center gap-2"
                          onClick={() =>
                            navigate(`/owner/clients/${client._id}/purchase-orders`)
                          }
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Orders
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && clients.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredClients.length} of {clients.length} client{clients.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}