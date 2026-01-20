import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import axios from "../../api/axios";

const BASE_URL = "http://localhost:5000";

export default function StaffSampleOrderDetail() {
  const { sampleId } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ====================
  // Fetch Sample Order
  // ====================
  useEffect(() => {
    const fetchSample = async () => {
      try {
        const res = await axios.get(`/samples/${sampleId}`);
        setOrder(res.data);
        setStatus(res.data.status);
      } catch (err) {
        alert("Failed to fetch sample order");
      } finally {
        setLoading(false);
      }
    };
    fetchSample();
  }, [sampleId]);

  if (loading) return <div className="p-6">Loading sample order...</div>;
  if (!order) return <div className="p-6">Sample order not found</div>;

  // ====================
  // Update Status ONLY
  // ====================
  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const res = await axios.patch(`/samples/${sampleId}/status`, {
        status,
      });
      setOrder(res.data);
      alert("Status updated successfully");
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // ====================
  // Priority Badge
  // ====================
  const priorityColors = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  // ====================
  // File Preview (same UI)
  // ====================
  const renderFilePreview = (file) => {
    if (!file) return <span className="text-gray-400">No file</span>;

    const ext = file.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
    const isPDF = ext === "pdf";
    const fileUrl = file;

    return (
      <div className="flex items-center gap-4">
        {isImage && (
          <div
            onClick={() => window.open(fileUrl, "_blank")}
            className="w-28 h-28 border border-dashed rounded-xl overflow-hidden cursor-pointer bg-gray-50"
          >
            <img
              src={fileUrl}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {isPDF && (
          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-200"
          >
            View PDF
          </button>
        )}

        <a
          href={fileUrl}
          download
          className="ml-auto text-blue-600 hover:underline text-sm"
        >
          Download
        </a>
      </div>
    );
  };

  return (
    <StaffLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">
            Sample Order: {order.sampleName}
          </h1>
          <p className="text-gray-500 mt-1">
            Tracking: {order.trackingNumber || "—"}
          </p>
        </div>

        {/* ================= BASIC INFO ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Sample Name</p>
            <p className="text-lg font-medium">{order.sampleName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Production Due Date</p>
            <p className="text-lg font-medium">
              {order.productionDueDate?.split("T")[0] || "—"}
            </p>
          </div>

          {/* ✅ PRIORITY (READ ONLY) */}
          <div>
            <p className="text-sm text-gray-500">Priority</p>
            {order.priority ? (
              <span
                className={`inline-block mt-1 px-4 py-1 rounded-full text-sm font-semibold ${priorityColors[order.priority]}`}
              >
                {order.priority}
              </span>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Fabric Details</p>
            <p className="text-lg font-medium">
              {order.fabricDetails || "—"}
            </p>
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
              disabled={updating || status === order.status}
              className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>

          {/* ===== Status Audit Info ===== */}
          {order.statusUpdatedBy && (
            <div className="mt-6 p-4 rounded-2xl bg-gray-50 border space-y-1">
              <p className="text-sm text-gray-500">Last status update</p>
              <p className="text-sm">
                <span className="font-medium">
                  {order.statusUpdatedBy.email}
                </span>{" "}
                ({order.statusUpdatedBy.role})
              </p>
              <p className="text-xs text-gray-500">
                {new Date(order.statusUpdatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* ================= FILES ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Files</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Graphic File</p>
              {renderFilePreview(order.graphicFile)}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Pattern File</p>
              {renderFilePreview(order.patternFile)}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Tech Pack Document</p>
              {renderFilePreview(order.techPackFile)}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
