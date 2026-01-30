import { useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import { FileText, ArrowLeft } from "lucide-react";
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
      const res = await axios.get(`/purchase-orders/client/${clientId}`);
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

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading purchase orders...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/staff/clients")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Clients</span>
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {clientName}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Purchase Orders</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {orders.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No purchase orders yet
              </h3>
              <p className="text-gray-500 text-sm">
                No purchase orders found for {clientName}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() =>
                  navigate(
                    `/staff/clients/${clientId}/purchase-orders/${order._id}`
                  )
                }
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-gray-300 cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                        <FileText size={24} className="text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {order.poNumber}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {orders.length} purchase order{orders.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}