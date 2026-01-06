import { useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function StaffPurchaseOrders() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  // ===============================
  // Fetch client name
  // ===============================
  const fetchClient = async () => {
    try {
      const res = await axios.get(`/clients/${clientId}`);
      setClientName(res.data?.name || "Client");
    } catch (err) {
      console.error("Failed to fetch client:", err);
      setClientName("Client");
    }
  };

  // ===============================
  // Fetch purchase orders (READ ONLY)
  // ===============================
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `/purchase-orders/client/${clientId}`
      );
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch purchase orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
    fetchOrders();
  }, [clientId]);

  return (
    <StaffLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold">
          {clientName} – Purchase Orders
        </h1>
        {/* <p className="text-gray-500 mt-2">
          View-only access to purchase orders
        </p> */}
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-6 bg-white rounded-3xl shadow-md text-center text-gray-500">
          No purchase orders found for {clientName}.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() =>
                navigate(
                  `/staff/clients/${clientId}/purchase-orders/${order._id}`
                )
              }
              className="bg-white p-6 rounded-3xl shadow-md flex justify-between items-center transition-transform hover:scale-[1.01] cursor-pointer"
            >
              {/* Left */}
              <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
                <h2 className="text-xl font-semibold">
                  {order.poNumber}
                </h2>
                <p className="text-gray-500">
                  {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
