import { useParams, useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import { Trash2, Plus, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function SampleOrders() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState("");
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    sampleId: null,
  });

  // Fetch client info + samples
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

  const handleDelete = async (sampleId) => {
    try {
      await axios.delete(`/samples/${sampleId}`);
      setSamples(samples.filter((s) => s._id !== sampleId));
      setDeleteDialog({ open: false, sampleId: null });
    } catch (err) {
      console.error("Failed to delete sample", err);
      alert("Failed to delete sample");
    }
  };

  if (loading) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading sample orders...</p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/owner/clients")}
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

            <button
              onClick={() =>
                navigate(
                  `/owner/clients/${clientId}/sample-orders/CreateSampleOrder`
                )
              }
              className="bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={20} />
              New Sample Order
            </button>
          </div>
        </div>

        {/* Content Section */}
        {samples.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sample orders yet</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Create your first sample order for {clientName}
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/owner/clients/${clientId}/sample-orders/CreateSampleOrder`
                  )
                }
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Sample Order
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {samples.map((sample) => (
              <div
                key={sample._id}
                onClick={() =>
                  navigate(
                    `/owner/clients/${clientId}/sample-orders/${sample._id}`
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                            sample.status === "Pending" 
                              ? "bg-yellow-100 text-yellow-800"
                              : sample.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : sample.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {sample.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({ open: true, sampleId: sample._id });
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl transition-all"
                      title="Delete Sample"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && samples.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {samples.length} sample order{samples.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Sample Order</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Are you sure you want to delete this sample order? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={() => setDeleteDialog({ open: false, sampleId: null })}
                className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteDialog.sampleId)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg shadow-red-500/30"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}