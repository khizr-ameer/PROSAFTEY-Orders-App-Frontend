import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios";

export default function ClientDetail() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch client info
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`/clients/${clientId}`);
        setClient(res.data);
        setForm(res.data); // prefill form
      } catch (err) {
        console.error("Failed to fetch client:", err);
        alert("Failed to fetch client info");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`/clients/${clientId}`, form);
      setClient(res.data);
      setIsEditing(false);
      alert("Client info updated successfully!");
    } catch (err) {
      console.error("Failed to update client:", err);
      alert(err.response?.data?.message || "Failed to update client info");
    }
  };

  if (loading) return <div className="p-4">Loading client info...</div>;
  if (!client) return <div className="p-4">Client not found</div>;

  return (
    <OwnerLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-medium">Client Details</h1>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setForm(client); // reset form if cancelling
            }}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg space-y-6">
          {[
            { label: "Name", name: "name", type: "text" },
            { label: "Company", name: "companyName", type: "text" },
            { label: "Phone", name: "phone", type: "tel" },
            { label: "Email", name: "email", type: "email" },
            { label: "Address", name: "address", type: "text" },
            { label: "Notes", name: "notes", type: "textarea" },
          ].map((field) => (
            <div
              key={field.name}
              className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center"
            >
              <span className="font-medium w-32">{field.label}:</span>
              {isEditing ? (
                field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black resize-none"
                    rows={4}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black"
                  />
                )
              ) : (
                <span className="text-gray-700">{client[field.name]}</span>
              )}
            </div>
          ))}

          {isEditing && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition"
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
