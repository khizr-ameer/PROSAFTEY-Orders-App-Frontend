import { useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import { FileText, ArrowLeft } from "lucide-react";
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

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading sample orders...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/staff/clients")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Clients</span>
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {clientName}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Sample Orders</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {samples.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sample orders yet
              </h3>
              <p className="text-gray-500 text-sm">
                No sample orders found for {clientName}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {samples.map((sample) => (
              <div
                key={sample._id}
                onClick={() =>
                  navigate(
                    `/staff/clients/${clientId}/sample-orders/${sample._id}`
                  )
                }
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-gray-300 cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                    {/* Left: Image + Info */}
                    <div className="flex items-center gap-4 flex-1">
                      {sample.graphicFile ? (
                        <img
                          src={sample.graphicFile}
                          alt={sample.sampleName}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0 hover:border-gray-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(sample.graphicFile, "_blank");
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500 border-2 border-gray-200 flex-shrink-0">
                          <FileText size={24} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {sample.sampleName}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                              sample.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : sample.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : sample.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {sample.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && samples.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {samples.length} sample order{samples.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}