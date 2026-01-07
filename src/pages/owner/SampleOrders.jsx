import { useParams, useNavigate } from "react-router-dom";
import OwnerLayout from "../../layouts/OwnerLayout";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../api/axios"; // your axios instance

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

  // Preload images to speed up future load
  const preloadImage = (url) => {
    const img = new Image();
    img.src = url;
  };

  // Fetch client info + samples
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await axios.get(`/clients/${clientId}`);
        setClientName(clientRes.data.name || `Client ${clientId}`);

        const sampleRes = await axios.get(`/samples/client/${clientId}`);
        setSamples(sampleRes.data || []);

        // Preload images
        sampleRes.data.forEach((s) => {
          if (s.graphicFile) {
            preloadImage(`http://localhost:5000/${s.graphicFile}`);
          }
        });
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <OwnerLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 sm:mb-0">
          {clientName} - Sample Orders
        </h1>
        <button
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-900 transition"
          onClick={() =>
            navigate(
              `/owner/clients/${clientId}/sample-orders/CreateSampleOrder`
            )
          }
        >
          + New Sample Order
        </button>
      </div>

      {samples.length === 0 ? (
        <div className="p-6 bg-white rounded-3xl shadow-md text-center text-gray-500">
          No sample orders yet. Create a new sample for {clientName}.
        </div>
      ) : (
        <div className="space-y-4">
          {samples.map((sample) => (
            <div
              key={sample._id}
              onClick={() =>
                navigate(
                  `/owner/clients/${clientId}/sample-orders/${sample._id}`
                )
              }
              className="bg-white p-6 rounded-3xl shadow-md flex justify-between items-center transition-transform hover:scale-[1.01] cursor-pointer"
            >
              {/* Left: Graphic Image + Name + Status */}
              <div className="flex items-center space-x-4">
                {sample.graphicFile ? (
                  <img
                    src={`http://localhost:5000/${sample.graphicFile}`}
                    alt={sample.sampleName}
                    className="w-12 h-12 rounded-xl object-cover border"
                    loading="lazy"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `http://localhost:5000/${sample.graphicFile}`,
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
                  <h2 className="text-xl font-semibold">{sample.sampleName}</h2>
                  <p className="text-gray-500">{sample.status}</p>
                </div>
              </div>

              {/* Right: Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({ open: true, sampleId: sample._id });
                }}
                className="p-2 rounded-xl hover:bg-red-50 transition"
                title="Delete Sample"
              >
                <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <h2 className="text-xl font-semibold">Delete Sample Order</h2>
            <p>Are you sure you want to delete this sample order?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteDialog({ open: false, sampleId: null })}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteDialog.sampleId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
