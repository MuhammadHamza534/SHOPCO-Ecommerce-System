import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import ProductsManager from "./pages/ProductsManager";
import DashboardLive from "./pages/DashboardLive";
import UsersManagement from "./pages/UsersManagement";
import { Categories, Coupons, Inventory, Newsletter, Settings } from "./pages/Operations";
import ProductMedia from "./pages/ProductMediaSafe";
import OrdersManagement from "./pages/OrdersManagement";
import OrderDetailAdmin from "./pages/OrderDetailAdminSafe";
import Reports from "./pages/Reports";
import AdminErrorBoundary from "./components/AdminErrorBoundary";
import Login from "./pages/Login";
import { useAdminAuth } from "./context/AdminAuth";

function ProtectedDashboard() {
  const { profile, loading } = useAdminAuth();
  const location = useLocation();
  if (loading) return <div className="auth-loading">Checking secure session…</div>;
  if (!profile) return <Navigate to="/login" replace state={{ from: location }} />;
  return <AdminErrorBoundary><DashboardLayout /></AdminErrorBoundary>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedDashboard />}>
        <Route index element={<DashboardLive />} />

        <Route path="/orders" element={<OrdersManagement />} />
        <Route path="/orders/:id" element={<OrderDetailAdmin />} />

        <Route path="/users" element={<UsersManagement />} />

        <Route path="/products" element={<ProductsManager />} />
        <Route path="/products/:id/images" element={<ProductMedia />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
