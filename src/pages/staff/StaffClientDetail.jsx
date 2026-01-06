import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import axios from "../../api/axios";

export default function StaffClientDetail() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch client info (READ ONLY)
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`/clients/${clientId}`);
        setClient(res.data);
      } catch (err) {
        console.error("Failed to fetch client:", err);
        alert("Failed to fetch client info");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (loading) return <div className="p-4">Loading client info...</div>;
  if (!client) return <div className="p-4">Client not found</div>;

  return (
    <StaffLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-medium">Client Details</h1>

        <div className="bg-white p-8 rounded-3xl shadow-lg space-y-6">
          {[
            { label: "Name", key: "name" },
            { label: "Company", key: "companyName" },
            { label: "Phone", key: "phone" },
            { label: "Email", key: "email" },
            { label: "Address", key: "address" },
            { label: "Notes", key: "notes" },
          ].map((field) => (
            <div
              key={field.key}
              className="flex flex-col sm:flex-row sm:space-x-6 items-start sm:items-center"
            >
              <span className="font-medium w-32">{field.label}:</span>
              <span className="text-gray-700 flex-1">
                {client[field.key] || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}
