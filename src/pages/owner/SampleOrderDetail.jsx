import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios";

const BASE_URL = "http://localhost:5000";

export default function SampleOrderDetail() {
  const { sampleId } = useParams();

  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

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
  // Handle Input / File Changes
  // ====================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // Replace file with the new one
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ====================
  // Save / Update
  // ====================
  const handleSave = async () => {
    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] instanceof File) {
          // Only send new file if user changed it
          data.append(key, form[key]);
        } else {
          data.append(key, form[key]);
        }
      });

      const res = await axios.put(`/samples/${sampleId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOrder(res.data);
      setForm(res.data);
      setCacheBuster(Date.now()); // Force image reload
      setIsEditing(false);
      alert("Sample order updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update sample order");
    }
  };

  if (loading) return <div className="p-4">Loading sample order...</div>;
  if (!order) return <div className="p-4">Sample order not found</div>;

  // ====================
  // File Preview Component
  // ====================
  const renderFilePreview = (file) => {
    if (!file) return <span className="text-gray-400">No file</span>;

    // Show selected file instantly while editing
    if (isEditing && file instanceof File) {
      const tempUrl = URL.createObjectURL(file);
      return (
        <div className="relative flex items-center gap-4">
          <img
            src={tempUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <a
            href={tempUrl}
            download={file.name}
            className="ml-auto text-blue-600 hover:underline"
          >
            Download
          </a>
        </div>
      );
    }

    const ext = file.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
    const isPDF = ext === "pdf";
    const isWord = ext === "doc" || ext === "docx";

    const fileUrl = `${BASE_URL}/${file}?v=${cacheBuster}`;

    return (
      <div className="relative flex items-center gap-4 mb-2">
        {isImage && (
          <img
            src={fileUrl}
            className="w-32 h-32 object-cover rounded-lg border cursor-pointer"
            onClick={() => window.open(fileUrl, "_blank")}
            alt="Preview"
          />
        )}
        {isPDF && (
          <iframe
            src={fileUrl}
            title="PDF Preview"
            className="w-64 h-48 border rounded-lg"
          />
        )}
        {isWord && <span className="text-gray-700">{file.split("/").pop()}</span>}

        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-blue-600 hover:underline"
        >
          Download
        </a>
      </div>
    );
  };

  // ====================
  // Render UI
  // ====================
  return (
    <OwnerLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Sample Order Details
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg space-y-6">
          {/* Sample Name */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Sample Name:</span>
            {isEditing ? (
              <input
                type="text"
                name="sampleName"
                value={form.sampleName}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black"
              />
            ) : (
              <span className="text-gray-700">{order.sampleName}</span>
            )}
          </div>

          {/* Fabric Details */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Fabric Details:</span>
            {isEditing ? (
              <textarea
                name="fabricDetails"
                value={form.fabricDetails}
                onChange={handleChange}
                rows={3}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black resize-none"
              />
            ) : (
              <span className="text-gray-700">{order.fabricDetails}</span>
            )}
          </div>

          {/* Graphic File */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Graphic File:</span>
            {isEditing ? (
              <input type="file" name="graphicFile" onChange={handleChange} />
            ) : (
              renderFilePreview(order.graphicFile)
            )}
          </div>

          {/* Pattern File */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Pattern File:</span>
            {isEditing ? (
              <input type="file" name="patternFile" onChange={handleChange} />
            ) : (
              renderFilePreview(order.patternFile)
            )}
          </div>

          {/* Tech Pack File */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Tech Pack:</span>
            {isEditing ? (
              <input type="file" name="techPackFile" onChange={handleChange} />
            ) : (
              renderFilePreview(order.techPackFile)
            )}
          </div>

          {/* Production Due Date */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Production Due Date:</span>
            {isEditing ? (
              <input
                type="date"
                name="productionDueDate"
                value={form.productionDueDate?.split("T")[0]}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black"
              />
            ) : (
              <span className="text-gray-700">{order.productionDueDate?.split("T")[0]}</span>
            )}
          </div>

          {/* Tracking Number */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Tracking Number:</span>
            {isEditing ? (
              <input
                type="text"
                name="trackingNumber"
                value={form.trackingNumber}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black"
              />
            ) : (
              <span className="text-gray-700">{order.trackingNumber}</span>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center">
            <span className="font-medium w-40">Order Status:</span>
            {isEditing ? (
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black"
              >
                {["Tech Pack Received","Cutting","Production","Quality Control","Completed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            ) : (
              <span className="text-gray-700">{order.status}</span>
            )}
          </div>

          {/* Payment Received */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center relative">
            <span className="font-medium w-40">Payment Received:</span>
            {isEditing ? (
              <div className="relative flex-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="paymentReceived"
                  value={form.paymentReceived}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:border-black"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            ) : (
              <span className="text-gray-700">{order.paymentReceived}%</span>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
