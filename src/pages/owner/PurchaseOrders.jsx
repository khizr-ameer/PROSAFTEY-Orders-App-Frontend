import { useParams, useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function PurchaseOrders() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    orderId: null,
  });

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
  // Fetch purchase orders
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

  // ===============================
  // Delete purchase order
  // ===============================
  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`/purchase-orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setDeleteDialog({ open: false, orderId: null });
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete purchase order"
      );
    }
  };

  return (
    <OwnerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 sm:mb-0">
          {clientName} – Purchase Orders
        </h1>

        <button
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-900 transition"
          onClick={() =>
            navigate(
              `/owner/clients/${clientId}/purchase-orders/CreatePurchaseOrder`
            )
          }
        >
          + New Purchase Order
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-6 bg-white rounded-3xl shadow-md text-center text-gray-500">
          No purchase orders yet. Create a new purchase for {clientName}.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() =>
                navigate(
                  `/owner/clients/${clientId}/purchase-orders/${order._id}`
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

              {/* Right actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({
                    open: true,
                    orderId: order._id,
                  });
                }}
                className="p-2 rounded-xl hover:bg-red-50 transition"
                title="Delete Purchase Order"
              >
                <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <h2 className="text-xl font-semibold">
              Delete Purchase Order
            </h2>
            <p>
              Are you sure you want to delete this purchase order?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  setDeleteDialog({ open: false, orderId: null })
                }
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteDialog.orderId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
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
