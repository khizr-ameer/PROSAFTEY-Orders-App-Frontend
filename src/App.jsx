import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";

import Login from "./auth/Login";
import Profile from "./pages/profile";

// Owner pages
import Dashboard from "./pages/owner/Dashboard";
import Clients from "./pages/owner/Clients";
import CreateClient from "./pages/owner/CreateClient";
import SampleOrders from "./pages/owner/SampleOrders";
import CreateSampleOrder from "./pages/owner/CreateSampleOrder";
import PurchaseOrders from "./pages/owner/PurchaseOrders";
import CreatePurchaseOrder from "./pages/owner/CreatePurchaseOrder";
import ClientDetail from "./pages/owner/ClientDetail";
import SampleOrderDetail from "./pages/owner/SampleOrderDetail";
import PurchaseOrderDetail from "./pages/owner/PurchaseOrderDetail";
import Staff from "./pages/owner/Staff";
import CreateStaff from "./pages/owner/CreateStaff";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffClients from "./pages/staff/StaffClients";
import StaffClientDetail from "./pages/staff/StaffClientDetail";
import StaffSampleOrders from "./pages/staff/StaffSampleOrders";
import StaffPurchaseOrders from "./pages/staff/StaffPurchaseOrders";
import StaffSampleOrderDetail from "./pages/staff/StaffSampleOrderDetail";
import StaffPurchaseOrderDetail from "./pages/staff/StaffPurchaseOrderDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Owner-only routes */}
        <Route element={<PrivateRoute roleRequired="OWNER" />}>
          <Route path="/owner/dashboard" element={<Dashboard />} />
          <Route path="/owner/clients" element={<Clients />} />
          <Route path="/owner/clients/create" element={<CreateClient />} />
          <Route path="/owner/clients/:clientId/sample-orders" element={<SampleOrders />} />
          <Route path="/owner/clients/:clientId/sample-orders/CreateSampleOrder" element={<CreateSampleOrder />} />
          <Route path="/owner/clients/:clientId/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/owner/clients/:clientId/purchase-orders/CreatePurchaseOrder" element={<CreatePurchaseOrder />} />
          <Route path="/owner/clients/:clientId" element={<ClientDetail />} />
          <Route path="/owner/clients/:clientId/sample-orders/:sampleId" element={<SampleOrderDetail />} />
          <Route path="/owner/clients/:clientId/purchase-orders/:purchaseId" element={<PurchaseOrderDetail />} />
          <Route path="/owner/staff" element={<Staff />} />
          <Route path="/owner/staff/create" element={<CreateStaff />} />
        </Route>

        {/* Staff-only routes */}
        <Route element={<PrivateRoute roleRequired="STAFF" />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/clients" element={<StaffClients />} />
          <Route path="/staff/clients/:clientId" element={<StaffClientDetail />} />
          <Route path="/staff/clients/:clientId/sample-orders" element={<StaffSampleOrders />} />
          <Route path="/staff/clients/:clientId/purchase-orders" element={<StaffPurchaseOrders />} />
          <Route path="/staff/clients/:clientId/sample-orders/:sampleId" element={<StaffSampleOrderDetail />} />
          <Route path="/staff/clients/:clientId/purchase-orders/:purchaseId" element={<StaffPurchaseOrderDetail />} />


        </Route>
         
        {/* Authenticated routes (Owner + Staff) */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
