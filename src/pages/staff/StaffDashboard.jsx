import { useEffect, useState } from "react";
import { X, Calendar, Package, Users, TrendingUp, AlertTriangle, Search } from "lucide-react";
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
  const [filteredModalData, setFilteredModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [showDueSoonAlert, setShowDueSoonAlert] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [allClients, setAllClients] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/dashboard/owner");
        const data = res.data;

        setStats([
          { title: "Clients", value: data.totalClients, icon: Users, color: "bg-blue-600" },
          { title: "Active Orders", value: data.activeOrders, icon: Package, color: "bg-yellow-500" },
          { title: "Completed Orders", value: data.completedOrders, icon: TrendingUp, color: "bg-purple-600" },
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

  // Fetch all clients for filter dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("/clients");
        setAllClients(res.data);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  // Apply filters whenever search/filter values change
  useEffect(() => {
    let filtered = [...modalData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.sampleName?.toLowerCase().includes(searchLower) ||
          item.poNumber?.toLowerCase().includes(searchLower) ||
          item.clientId?.name?.toLowerCase().includes(searchLower) ||
          item.company?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Priority filter
    if (filterPriority) {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }

    // Client filter
    if (filterClient) {
      filtered = filtered.filter(item => {
        const clientId = item.clientId?._id || item.clientId || item._id;
        return clientId === filterClient;
      });
    }

    setFilteredModalData(filtered);
  }, [searchTerm, filterStatus, filterPriority, filterClient, modalData]);

  const handleCardClick = async (type) => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    setModalData([]);
    resetFilters();

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
          const activeSamples = samples.data.filter(s => s.status !== "Completed");
          const activePurchases = purchases.data.filter(p => p.status !== "Completed");
          res = { data: [...activeSamples, ...activePurchases] };
          break;
        case "Completed Orders":
          const [completedSamples, completedPurchases] = await Promise.all([
            axios.get("/samples"),
            axios.get("/purchase-orders")
          ]);
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
    resetFilters();

    try {
      const [samples, purchases] = await Promise.all([
        axios.get("/samples"),
        axios.get("/purchase-orders")
      ]);
      
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
    resetFilters();

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
    const orderType = order.sampleName ? "sample-orders" : "purchase-orders";
    const clientId = order.clientId?._id || order.clientId;
    window.location.href = `/staff/clients/${clientId}/${orderType}/${order._id}`;
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterClient("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData([]);
    setModalType(null);
    resetFilters();
  };

  const isOrderModal = modalType && modalType !== "Clients";
  const hasActiveFilters = searchTerm || filterStatus || filterPriority || filterClient;

  return (
    <StaffLayout>
      <div className="min-h-screen pb-10 space-y-10">

        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-100 rounded-3xl p-8 shadow-inner border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
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
                    className="bg-white shadow-lg hover:shadow-2xl transition-all rounded-3xl p-6 text-left group cursor-pointer transform hover:scale-105 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-500 font-medium text-sm">{card.title}</p>
                        <h2 className="text-3xl font-bold mt-2 text-gray-900">
                          {card.value}
                        </h2>
                      </div>
                      <div className={`${card.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 font-medium mt-3 group-hover:underline">
                      View Details →
                    </p>
                  </button>
                );
              })}
        </div>

        {/* ================= STATUS BREAKDOWN ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
            <Package className="w-5 h-5 text-gray-700" />
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
                    className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 text-center transition-all cursor-pointer group border-2 border-transparent hover:border-gray-300"
                  >
                    <p className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                      {item.title}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-700 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view
                    </p>
                  </button>
                ))}
          </div>
        </div>

        {/* ================= ALERT CARD ================= */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
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
                  <h3 className="font-semibold text-gray-900">⚠ Orders Due Soon</h3>
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{modalType}</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search & Filters */}
              {!modalLoading && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={modalType === "Clients" ? "Search clients..." : "Search orders or clients..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Filters - Only for Orders */}
                    {isOrderModal && (
                      <>
                        {/* Status Filter */}
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                        >
                          <option value="">All Statuses</option>
                          <option value="Tech Pack Received">Tech Pack Received</option>
                          <option value="Cutting">Cutting</option>
                          <option value="Production">Production</option>
                          <option value="Quality Control">Quality Control</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                        >
                          <option value="">All Priorities</option>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>

                        {/* Client Filter */}
                        <select
                          value={filterClient}
                          onChange={(e) => setFilterClient(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                        >
                          <option value="">All Clients</option>
                          {allClients.map((client) => (
                            <option key={client._id} value={client._id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  )}

                  {/* Results count */}
                  <p className="mt-2 text-sm text-gray-600">
                    Showing {filteredModalData.length} of {modalData.length} results
                  </p>
                </div>
              )}

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredModalData.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">
                    {hasActiveFilters ? "No results match your filters" : "No data available"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredModalData.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (item.sampleName || item.poNumber) {
                            handleOrderClick(item);
                          }
                        }}
                        className={`bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition border border-gray-200 ${
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
                                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full">
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
                            <div className="text-gray-700 text-sm font-medium">
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