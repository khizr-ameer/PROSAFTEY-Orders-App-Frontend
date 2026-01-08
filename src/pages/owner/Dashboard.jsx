import { useEffect, useState } from "react";
import OwnerLayout from "../../layouts/OwnerLayout";
import axios from "../../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [alerts, setAlerts] = useState({
    dueSoon: 0,
    paymentPending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // ✅ CORRECT API CALL
        const res = await axios.get("/dashboard/owner");
        const data = res.data;

        /* ================= MAIN STATS ================= */
        setStats([
          { title: "Clients", value: data.totalClients },
          { title: "Staff Members", value: data.totalStaff },
          { title: "Active Orders", value: data.activeOrders },
          { title: "Completed Orders", value: data.completedOrders },
        ]);

        /* ================= STATUS BREAKDOWN ================= */
        const formattedStatus = Object.entries(data.statusBreakdown).map(
          ([key, value]) => ({
            title: key,
            value,
          })
        );
        setStatusStats(formattedStatus);

        /* ================= ALERTS ================= */
        setAlerts({
          dueSoon: data.dueSoonOrders,
          paymentPending: data.pendingPayments,
        });

      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <OwnerLayout>
        <div className="p-10 text-gray-500">Loading dashboard...</div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="min-h-screen pb-10 space-y-10">

        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 rounded-3xl p-8 shadow-inner">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Owner Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of operations & performance
          </p>
        </div>

        {/* ================= MAIN STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((card, i) => (
            <div
              key={i}
              className="bg-white shadow-lg hover:shadow-2xl transition rounded-3xl p-6"
            >
              <p className="text-gray-400 font-medium">{card.title}</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-800">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* ================= STATUS BREAKDOWN ================= */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h2 className="text-xl font-semibold mb-6">
            Order Status Breakdown
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {statusStats.map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-5 text-center"
              >
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-semibold mb-2">⚠ Orders Due Soon</h3>
            <p className="text-gray-500 text-sm">
              {alerts.dueSoon} orders due in the next 3 days
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-semibold mb-2">💰 Payments Pending</h3>
            <p className="text-gray-500 text-sm">
              {alerts.paymentPending} orders have pending payments
            </p>
          </div>
        </div>

      </div>
    </OwnerLayout>
  );
}
