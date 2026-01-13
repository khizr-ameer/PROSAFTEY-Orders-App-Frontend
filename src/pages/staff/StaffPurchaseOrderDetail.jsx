import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import axios from "../../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StaffPurchaseOrderDetail({ user }) {
  const { purchaseId } = useParams();

  const [poData, setPoData] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // =========================
  // Fetch Purchase Order
  // =========================
  useEffect(() => {
    const fetchPO = async () => {
      try {
        const res = await axios.get(`/purchase-orders/${purchaseId}`);
        setPoData(res.data);
        setStatus(res.data.status);
      } catch (err) {
        console.error("Failed to fetch purchase order:", err);
        alert("Failed to fetch purchase order");
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [purchaseId]);

  if (loading) return <StaffLayout>Loading purchase order...</StaffLayout>;
  if (!poData)
    return <StaffLayout>Purchase order not found</StaffLayout>;

  // =========================
  // Update Status ONLY
  // =========================
  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const res = await axios.patch(`/purchase-orders/${purchaseId}/status`, {
        status,
      });
      setPoData(res.data);
      alert("Status updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // =========================
  // Open File (PDF / Image)
  // =========================
  const openFile = (filePath) => {
    if (!filePath) return;
    const cacheBuster = new Date().getTime();
    window.open(`${BASE_URL}/${filePath}?v=${cacheBuster}`, "_blank");
  };

  return (
    <StaffLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">
            Purchase Order: {poData.poNumber}
          </h1>
          <p className="text-gray-500 mt-1">
            Tracking: {poData.trackingNumber || "—"}
          </p>
          
        </div>

        {/* ================= BASIC INFO ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">PO Number</p>
            <p className="text-lg font-medium">{poData.poNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tracking Number</p>
            <p className="text-lg font-medium">{poData.trackingNumber || "—"}</p>
          </div>
           <div>
            <p className="text-sm text-gray-500">Priority</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                ${
                  poData.priority === "URGENT"
                    ? "bg-red-100 text-red-700"
                    : poData.priority === "HIGH"
                    ? "bg-orange-100 text-orange-700"
                    : poData.priority === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
            >
              {poData.priority || "LOW"}
            </span>
          </div>
        </div>

        {/* ================= STATUS UPDATE ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Order Status</h2>

          <div className="grid sm:grid-cols-2 gap-6 items-end">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-xl px-4 py-2"
              >
                {[
                  "Tech Pack Received",
                  "Cutting",
                  "Production",
                  "Quality Control",
                  "Completed",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={updating || status === poData.status}
              className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>

          {/* ===== Status Audit Info ===== */}
          {poData.statusUpdatedBy && (
            <div className="mt-6 p-4 rounded-2xl bg-gray-50 border space-y-1">
              <p className="text-sm text-gray-500">Last status update</p>
              <p className="text-sm">
                <span className="font-medium">
                  {poData.statusUpdatedBy.email}
                </span>{" "}
                ({poData.statusUpdatedBy.role})
              </p>
              <p className="text-xs text-gray-500">
                {new Date(poData.statusUpdatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="space-y-6">
          {poData.products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 shadow-md space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{product.productName}</h2>
                <p className="text-gray-500 font-medium">
                  Total:{" "}
                  {product.sizes.reduce((total, s) => total + s.quantity, 0)}
                </p>
              </div>

              {/* Product Image */}
              <div className="space-y-2">
                <div
                  className="w-32 h-32 border border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer"
                  onClick={() =>
                    openFile(product.productImage)
                  }
                >
                  {product.productImage ? (
                    <img
                      src={`${BASE_URL}/${product.productImage}`}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">No Image</span>
                  )}
                </div>
              </div>

              {/* Product Description */}
              {product.productDescription && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product Description</p>
                  <p className="text-gray-700">{product.productDescription}</p>
                </div>
              )}

              {/* Sizes */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Size Breakdown</p>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {product.sizes.map((size, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center bg-gray-50 rounded-xl p-2"
                    >
                      <span className="text-xs font-medium text-gray-500">
                        {size.sizeName}
                      </span>
                      <span className="text-sm font-semibold">{size.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= INVOICE FILE =================
        {poData.invoiceFile && (
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <p className="text-sm text-gray-500">Invoice</p>
            <button
              onClick={() => openFile(poData.invoiceFile)}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-200"
            >
              View Invoice
            </button>
          </div>
        )} */}
      </div>
    </StaffLayout>
  );
}
