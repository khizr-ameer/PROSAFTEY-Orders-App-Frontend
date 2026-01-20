import { useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function StaffSampleOrders() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState("");
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch client info + samples (READ ONLY)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await axios.get(`/clients/${clientId}`);
        setClientName(clientRes.data.name || `Client ${clientId}`);

        const sampleRes = await axios.get(`/samples/client/${clientId}`);
        setSamples(sampleRes.data || []);
      } catch (err) {
        console.error("Error fetching samples or client info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold">
          {clientName} – Sample Orders
        </h1>
        {/* <p className="text-gray-500 mt-2">
          View-only access to sample orders
        </p> */}
      </div>

      {samples.length === 0 ? (
        <div className="p-6 bg-white rounded-3xl shadow-md text-center text-gray-500">
          No sample orders found for {clientName}.
        </div>
      ) : (
        <div className="space-y-4">
          {samples.map((sample) => (
            <div
              key={sample._id}
              onClick={() =>
                navigate(
                  `/staff/clients/${clientId}/sample-orders/${sample._id}`
                )
              }
              className="bg-white p-6 rounded-3xl shadow-md flex justify-between items-center transition-transform hover:scale-[1.01] cursor-pointer"
            >
              {/* Left: Image + Name + Status */}
              <div className="flex items-center space-x-4">
                {sample.graphicFile ? (
                  <img
                    src={sample.graphicFile}
                    alt={sample.sampleName}
                    className="w-12 h-12 rounded-xl object-cover border"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `{sample.graphicFile}`,
                        "_blank"
                      );
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    No Image
                  </div>
                )}

                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">
                    {sample.sampleName}
                  </h2>
                  <p className="text-gray-500">{sample.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
