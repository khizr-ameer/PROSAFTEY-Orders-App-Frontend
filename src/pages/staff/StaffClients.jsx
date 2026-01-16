import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import axios from "../../api/axios";

export default function StaffClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <StaffLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold">Clients</h1>
      </div>

      {loading ? (
        <div>Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="p-6 bg-white rounded-3xl shadow-md text-center text-gray-500">
          No clients available.
        </div>
      ) : (
        <div className="space-y-6">
          {clients.map((client) => (
            <div
              key={client._id}
              className="bg-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-center transition-transform hover:scale-[1.01]"
            >
              {/* ================= CLIENT NAME (NON-CLICKABLE) ================= */}
              <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center flex-1">
                <div>
                  <h2 className="text-xl font-semibold">{client.name}</h2>
                </div>
              </div>

              {/* ================= ORDER BUTTONS ================= */}
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <button
                  className="bg-black text-white px-3 py-2 rounded-xl font-semibold hover:bg-gray-900 transition"
                  onClick={() =>
                    navigate(`/staff/clients/${client._id}/sample-orders`)
                  }
                >
                  Sample Orders
                </button>

                <button
                  className="bg-black text-white px-3 py-2 rounded-xl font-semibold hover:bg-gray-900 transition"
                  onClick={() =>
                    navigate(`/staff/clients/${client._id}/purchase-orders`)
                  }
                >
                  Purchase Orders
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
