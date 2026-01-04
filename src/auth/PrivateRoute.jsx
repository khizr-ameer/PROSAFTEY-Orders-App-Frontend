// src/auth/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ roleRequired }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in → redirect to login
  if (!token) return <Navigate to="/" replace />;

  // Role mismatch → redirect to login
  if (roleRequired && role !== roleRequired) return <Navigate to="/" replace />;

  // All good → render child routes
  return <Outlet />;
}
