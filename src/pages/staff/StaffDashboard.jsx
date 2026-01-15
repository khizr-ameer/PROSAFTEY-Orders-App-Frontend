import { useEffect, useState } from "react";
import { X, Calendar, Package, Users, TrendingUp, AlertTriangle } from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import axios from "../../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [dueSoon, setDueSoon] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [showDueSoonAlert, setShowDueSoonAlert] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/dashboard/owner");
        const data = res.data;

        setStats([
          { title: "Clients", value: data.totalClients, icon: Users, color: "bg-blue-500" },
          { title: "Active Orders", value: data.activeOrders, icon: Package, color: "bg-green-500" },
          { title: "Completed Orders", value: data.completedOrders, icon: TrendingUp, color: "bg-indigo-500" },
        ]);

        const formattedStatus = Object.entries(data.statusBreakdown).map(
          ([key, value]) => ({ title: key, value })
        );
        setStatusStats(formattedStatus);

        setDueSoon(data.dueSoonOrders);
      } catch (err) {
        console.error("Failed to fetch staff dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleCardClick = async (type) => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    setModalData([]);

    try {
      let res;
      switch (type) {
        case "Clients":
          res = await axios.get("/clients");
          break;
        case "Active Orders":
          const [samples, purchases] = await Promise.all([
            axios.get("/samples"),
            axios.get("/purchase-orders")
          ]);
          // Filter only non-completed orders
          const activeSamples = samples.data.filter(s => s.status !== "Completed");
          const activePurchases = purchases.data.filter(p => p.status !== "Completed");
          res = { data: [...activeSamples, ...activePurchases] };
          break;
        case "Completed Orders":
          const [completedSamples, completedPurchases] = await Promise.all([
            axios.get("/samples"),
            axios.get("/purchase-orders")
          ]);
          // Filter only completed orders
          const filteredSamples = completedSamples.data.filter(s => s.status === "Completed");
          const filteredPurchases = completedPurchases.data.filter(p => p.status === "Completed");
          res = { data: [...filteredSamples, ...filteredPurchases] };
          break;
        default:
          res = { data: [] };
      }
      setModalData(res.data);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusClick = async (status) => {
    setModalType(`Orders in ${status}`);
    setModalOpen(true);
    setModalLoading(true);
    setModalData([]);

    try {
      const [samples, purchases] = await Promise.all([
        axios.get("/samples"),
        axios.get("/purchase-orders")
      ]);
      
      // Filter by status
      const filteredSamples = samples.data.filter(s => s.status === status);
      const filteredPurchases = purchases.data.filter(p => p.status === status);
      
      setModalData([...filteredSamples, ...filteredPurchases]);
    } catch (err) {
      console.error(`Failed to fetch orders for ${status}:`, err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDueSoonClick = async () => {
    setModalType("Orders Due Soon");
    setModalOpen(true);
    setModalLoading(true);
    setModalData([]);

    try {
      const res = await axios.get("/samples?dueSoon=true");
      setModalData(res.data);
    } catch (err) {
      console.error("Failed to fetch due soon orders:", err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    // Navigate to order details with client ID in path
    const orderType = order.sampleName ? "sample-orders" : "purchase-orders";
    const clientId = order.clientId?._id || order.clientId;
    window.location.href = `/staff/clients/${clientId}/${orderType}/${order._id}`;
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData([]);
    setModalType(null);
  };

  return (
    <StaffLayout>
      <div className="min-h-screen pb-10 space-y-10">

        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 rounded-3xl p-8 shadow-inner">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Staff Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Operational overview
          </p>
        </div>

        {/* ================= DUE SOON ALERT ================= */}
        {!loading && dueSoon > 0 && showDueSoonAlert && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  ⚠️ {dueSoon} Order{dueSoon > 1 ? "s" : ""} Due Soon
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You have orders due within the next 3 days that require attention.
                </p>
                <button
                  onClick={handleDueSoonClick}
                  className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  View Details →
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowDueSoonAlert(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ================= MAIN STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white shadow-lg rounded-3xl p-6 h-32 animate-pulse" />
              ))
            : stats.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleCardClick(card.title)}
                    className="bg-white shadow-lg hover:shadow-2xl transition-all rounded-3xl p-6 text-left group cursor-pointer transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-400 font-medium text-sm">{card.title}</p>
                        <h2 className="text-3xl font-bold mt-2 text-gray-800">
                          {card.value}
                        </h2>
                      </div>
                      <div className={`${card.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-indigo-600 font-medium mt-3 group-hover:underline">
                      View Details →
                    </p>
                  </button>
                );
              })}
        </div>

        {/* ================= STATUS BREAKDOWN ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Order Status Breakdown
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-5 h-20 animate-pulse" />
                ))
              : statusStats.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleStatusClick(item.title)}
                    className="bg-gray-50 hover:bg-indigo-50 rounded-2xl p-5 text-center transition-all cursor-pointer group border-2 border-transparent hover:border-indigo-200"
                  >
                    <p className="text-sm text-gray-500 group-hover:text-indigo-700 font-medium">
                      {item.title}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-gray-800 group-hover:text-indigo-600">
                      {item.value}
                    </p>
                    <p className="text-xs text-indigo-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view
                    </p>
                  </button>
                ))}
          </div>
        </div>

        {/* ================= ALERT CARD ================= */}
        <div className="bg-white rounded-3xl p-6 shadow-md">
          {loading ? (
            <div className="h-20 w-full animate-pulse bg-gray-50 rounded-xl" />
          ) : (
            <button
              onClick={handleDueSoonClick}
              className="w-full text-left hover:bg-amber-50 rounded-xl p-4 transition-all group border-2 border-transparent hover:border-amber-200"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">⚠ Orders Due Soon</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {dueSoon} order{dueSoon !== 1 ? "s" : ""} due in the next 3 days
                  </p>
                  <p className="text-xs text-amber-600 font-medium mt-2 group-hover:underline">
                    View Orders →
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* ================= MODAL ================= */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{modalType}</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : modalData.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {modalData.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (item.sampleName || item.poNumber) {
                            handleOrderClick(item);
                          }
                        }}
                        className={`bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition ${
                          item.sampleName || item.poNumber ? "cursor-pointer" : ""
                        }`}
                      >
                        {/* Client Display */}
                        {modalType === "Clients" && (
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            {item.company && <p className="text-sm text-gray-500">{item.company}</p>}
                          </div>
                        )}

                        {/* Order Display */}
                        {(item.sampleName || item.poNumber) && (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800">
                                  {item.sampleName || item.poNumber}
                                </p>
                                {item.priority && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    item.priority === "URGENT" ? "bg-red-100 text-red-700" :
                                    item.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                    item.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-green-100 text-green-700"
                                  }`}>
                                    {item.priority}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Client: {item.clientId?.name || "N/A"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                                  {item.status}
                                </span>
                                {item.productionDueDate && (
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(item.productionDueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-indigo-600 text-sm font-medium">
                              View →
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </StaffLayout>
  );
}