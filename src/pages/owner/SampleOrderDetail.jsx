import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios";

export default function SampleOrderDetail() {
  const { sampleId } = useParams();

  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ====================
  // Fetch Sample Order
  // ====================
  useEffect(() => {
    const fetchSample = async () => {
      try {
        const res = await axios.get(`/samples/${sampleId}`);
        setOrder(res.data);
        setForm(res.data);
      } catch (err) {
        alert("Failed to fetch sample order");
      } finally {
        setLoading(false);
      }
    };
    fetchSample();
  }, [sampleId]);

  // ====================
  // Handle Input Changes
  // ====================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ====================
  // Save
  // ====================
  const handleSave = async () => {
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));

      const res = await axios.put(`/samples/${sampleId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOrder(res.data);
      setForm(res.data);
      setIsEditing(false);
      alert("Sample order updated successfully!");
    } catch (err) {
      alert("Failed to update sample order");
    }
  };

  if (loading) return <div className="p-6">Loading sample order...</div>;
  if (!order) return <div className="p-6">Sample order not found</div>;

  // ====================
  // File Preview - CLOUDINARY VERSION
  // ====================
  const renderFilePreview = (file) => {
    if (!file) return <span className="text-gray-400">No file</span>;

    // Cloudinary URLs are complete, use them directly
    const fileUrl = file;
    const ext = file.split(".").pop().toLowerCase().split("?")[0]; // Handle query params
    const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
    const isPDF = ext === "pdf";

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

  // ====================
  // UI
  // ====================
  return (
    <OwnerLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">
            Sample Order: {order.sampleName}
          </h1>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 rounded-xl bg-black font-semibold text-white hover:bg-gray-900 transition"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl p-8 shadow-md grid sm:grid-cols-2 gap-6">
          {/* Sample Name */}
          <div>
            <p className="text-sm text-gray-500">Sample Name</p>
            {isEditing ? (
              <input
                name="sampleName"
                value={form.sampleName}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2"
              />
            ) : (
              <p className="text-lg font-medium">{order.sampleName}</p>
            )}
          </div>

          {/* Tracking */}
          <div>
            <p className="text-sm text-gray-500">Tracking Number</p>
            {isEditing ? (
              <input
                name="trackingNumber"
                value={form.trackingNumber}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2"
              />
            ) : (
              <p className="text-lg font-medium">{order.trackingNumber}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            {isEditing ? (
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
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
            ) : (
              <p className="text-lg font-medium">{order.status}</p>
            )}
          </div>

          {/* 🔥 PRIORITY (NEW) */}
          <div>
            <p className="text-sm text-gray-500">Priority</p>
            {isEditing ? (
              <select
                name="priority"
                value={form.priority || "LOW"}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    order.priority === "URGENT"
                      ? "bg-red-100 text-red-700"
                      : order.priority === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : order.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {order.priority || "LOW"}
              </span>
            )}
          </div>

          {/* Payment */}
          <div>
            <p className="text-sm text-gray-500">Payment Received</p>
            {isEditing ? (
              <input
                type="number"
                name="paymentReceived"
                value={form.paymentReceived}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2"
              />
            ) : (
              <p className="text-lg font-medium">{order.paymentReceived}%</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <p className="text-sm text-gray-500">Production Due Date</p>
            {isEditing ? (
              <input
                type="date"
                name="productionDueDate"
                value={form.productionDueDate?.split("T")[0]}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2"
              />
            ) : (
              <p className="text-lg font-medium">
                {order.productionDueDate?.split("T")[0]}
              </p>
            )}
          </div>

          {/* Fabric */}
          <div className="sm:col-span-2">
            <p className="text-small text-gray-500">Fabric Details</p>
            {isEditing ? (
              <textarea
                name="fabricDetails"
                value={form.fabricDetails}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-xl px-4 py-2 resize-none"
              />
            ) : (
              <p className="text-md font-medium">{order.fabricDetails}</p>
            )}
          </div>
        </div>

        {/* Files */}
        <div className="bg-white rounded-3xl p-8 shadow-md space-y-6">
          <h2 className="text-xl font-semibold">Files</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Graphic File image</p>
              {isEditing ? (
                <input type="file" name="graphicFile" onChange={handleChange} />
              ) : (
                renderFilePreview(order.graphicFile)
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Pattern File image</p>
              {isEditing ? (
                <input type="file" name="patternFile" onChange={handleChange} />
              ) : (
                renderFilePreview(order.patternFile)
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Tech Pack Document</p>
              {isEditing ? (
                <input type="file" name="techPackFile" onChange={handleChange} />
              ) : (
                renderFilePreview(order.techPackFile)
              )}
            </div>
          </div>
        </div>

        {/* Save */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-black text-white"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}