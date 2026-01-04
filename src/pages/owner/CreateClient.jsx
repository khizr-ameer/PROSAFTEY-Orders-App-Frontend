import OwnerLayout from "../../layouts/OwnerLayout";
import { useState } from "react";
import axios from "../../api/axios";

export default function CreateClient() {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirmation dialog (reuse same style as logout)
    const confirmed = window.confirm("Are you sure you want to create this client?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await axios.post("/clients", form);
      alert("Client created successfully!");
      // Optionally: reset form
      setForm({
        name: "",
        companyName: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout>
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6">Create Client</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm max-w-2xl mx-auto space-y-6"
      >
        {[
          { label: "Name", name: "name", type: "text", required: true },
          { label: "Company Name", name: "companyName", type: "text" },
          { label: "Phone", name: "phone", type: "tel", required: true },
          { label: "Email", name: "email", type: "email" },
          { label: "Address", name: "address", type: "text" },
        ].map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="mb-2 font-medium">
              {field.label} {field.required ? "*" : ""}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required || false}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            />
          </div>
        ))}

        <div className="flex flex-col">
          <label className="mb-2 font-medium">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black resize-none"
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl text-lg mt-4 hover:bg-gray-900 transition"
        >
          {loading ? "Creating..." : "Create Client"}
        </button>
      </form>
    </OwnerLayout>
  );
}
