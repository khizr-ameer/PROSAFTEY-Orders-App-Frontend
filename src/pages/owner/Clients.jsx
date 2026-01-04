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

    return (
      <OwnerLayout>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-2 sm:space-y-0">
          <h1 className="text-3xl sm:text-4xl font-semibold">Clients</h1>

          <div className="flex space-x-2">
            <button
              className="bg-black text-white px-5 py-2 rounded-xl font-semibold hover:bg-gray-900 transition"
              onClick={() => navigate("/owner/clients/create")}
            >
              + New Client
            </button>

            {clients.length > 0 && !deleteMode && (
              <button
                className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-700 transition"
                onClick={() => setDeleteMode(true)}
              >
                Delete Clients
              </button>
            )}

            {deleteMode && (
              <>
                <button
                  className="bg-red-700 text-white px-5 py-2 rounded-xl font-semibold hover:bg-red-800 transition"
                  onClick={handleDeleteSelected}
                >
                  Delete Selected
                </button>
                <button
                  className="bg-gray-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-gray-600 transition"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-6 bg-white rounded-3xl shadow-md text-center text-gray-500">
            No clients yet. Click "+ New Client" to create one.
          </div>
        ) : (
          <div className="space-y-6">
            {clients.map((client) => (
              <div
                key={client._id}
                className={`bg-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-center transition-transform hover:scale-[1.01] cursor-pointer ${
                  deleteMode && selectedClients.includes(client._id)
                    ? "border-2 border-red-600"
                    : ""
                }`}
              >
                <div
                  className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center flex-1"
                  onClick={() => {
                    if (deleteMode) toggleSelect(client._id);
                    else navigate(`/owner/clients/${client._id}`);
                  }}
                >
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client._id)}
                      onChange={() => toggleSelect(client._id)}
                      className="mr-4 w-5 h-5"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{client.name}</h2>
                    <p className="text-gray-500">{client.email}</p>
                  </div>
                </div>

                {!deleteMode && (
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button
                      className="bg-black text-white px-3 py-2 rounded-xl font-semibold hover:bg-gray-900 transition"
                      onClick={() =>
                        navigate(`/owner/clients/${client._id}/sample-orders`)
                      }
                    >
                      Sample Orders
                    </button>
                    <button
                      className="bg-black text-white px-3 py-2 rounded-xl font-semibold hover:bg-gray-900 transition"
                      onClick={() =>
                        navigate(`/owner/clients/${client._id}/purchase-orders`)
                      }
                    >
                      Purchase Orders
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </OwnerLayout>
    );
  }
