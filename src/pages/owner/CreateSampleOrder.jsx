import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios"; // make sure axios is configured

export default function CreateSampleOrder() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sampleName: "",
    fabricDetails: "",
    techPack: null,
    pattern: null,
    graphic: null,
    productionDueDate: "",
    trackingNumber: "",
    status: "Tech Pack Received",
    paymentReceived: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sampleName) {
      alert("Sample Name is required");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("sampleName", form.sampleName);
      data.append("fabricDetails", form.fabricDetails);
      data.append("productionDueDate", form.productionDueDate);
      data.append("trackingNumber", form.trackingNumber);
      data.append("status", form.status);
      data.append("paymentReceived", form.paymentReceived || 0);
      data.append("clientId", clientId);

      if (form.techPack) data.append("techPack", form.techPack);
      if (form.pattern) data.append("pattern", form.pattern);
      if (form.graphic) data.append("graphic", form.graphic);

      const res = await axios.post("/samples", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Sample Order Created Successfully!");
      navigate(`/owner/clients/${clientId}/sample-orders`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create sample order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Create Sample Order</h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="text"
            name="sampleName"
            value={form.sampleName}
            onChange={handleChange}
            placeholder="Sample Name"
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
          />

          <textarea
            name="fabricDetails"
            value={form.fabricDetails}
            onChange={handleChange}
            placeholder="Fabric Details"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
          />

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <label className="flex-1">
              Tech Pack File
              <input
                type="file"
                name="techPack"
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </label>

            <label className="flex-1">
              Pattern File
              <input
                type="file"
                name="pattern"
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </label>

            <label className="flex-1">
              Graphic File
              <input
                type="file"
                name="graphic"
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600 block">Production Due Date</label>
            <p className="text-xs text-gray-400">
              Select the expected date by which this sample should be ready
            </p>
            <input
              type="date"
              name="productionDueDate"
              value={form.productionDueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            />
          </div>

          <input
            type="text"
            name="trackingNumber"
            value={form.trackingNumber}
            onChange={handleChange}
            placeholder="Tracking Number"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
          />

          <div className="space-y-1">
            <label className="text-sm text-gray-600 block">Order Status</label>
            <p className="text-xs text-gray-400">
              Select the current production stage of this sample order
            </p>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            >
              <option>Tech Pack Received</option>
              <option>Cutting</option>
              <option>Production</option>
              <option>Quality Control</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="space-y-1 relative">
            <label className="text-sm text-gray-600 block">Payment Received</label>
            <p className="text-xs text-gray-400">Enter payment in percentage (0–100)</p>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                name="paymentReceived"
                value={form.paymentReceived}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-black"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              onClick={() => navigate(`/owner/clients/${clientId}/sample-orders`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition"
            >
              {loading ? "Creating..." : "Create Sample Order"}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}
