// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// 🌐 Public Pages
import Home from "./pages/Home";
import RoleSelector from "./pages/auth/RoleSelector";
import Signup from "./pages/auth/Signup";
import Login from "./pages/Login";
import WorkerLogin from "./pages/auth/WorkerLogin";   // ✅ ADDED

// 🚪 Logout
import Logout from "./pages/settings/Logout";

// 🧑‍💼 Provider
import ProviderSearch from "./pages/providers/ProviderSearch";
import ProviderDashboard from "./pages/providers/ProviderDashboard";

// 👷 Worker
import WorkerDashboard from "./pages/workers/WorkerDashboard";

// 🛠 Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminWorkers from "./pages/admin/workers/AdminWorkers";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminSearch from "./pages/admin/AdminSearch";
import AdminWorkerEdit from "./pages/admin/AdminWorkerEdit";
import AdminProviderEdit from "./pages/admin/AdminProviderEdit";
import ContractManager from "./pages/admin/ContractManager";
import AdminLeadHistory from "./pages/admin/AdminLeadHistory";
import PendingWorkersDebug from "./pages/admin/PendingWorkersDebug";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 🌐 Public */}
      <Route path="/" element={<Home />} />
      <Route path="/role" element={<RoleSelector />} />
      <Route path="/signup/:role" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/worker/login" element={<WorkerLogin />} />  {/* ✅ ADDED */}
      <Route path="/logout" element={<Logout />} />

      {/* 🧑‍💼 Provider */}
      <Route
        path="/provider/dashboard"
        element={
          user?.role === "provider"
            ? <ProviderDashboard />
            : <Navigate to="/" />
        }
      />
      <Route
        path="/provider/search"
        element={
          user?.role === "provider"
            ? <ProviderSearch />
            : <Navigate to="/" />
        }
      />

      {/* 👷 Worker */}
      <Route
        path="/worker/dashboard"
        element={
          user?.role === "worker"
            ? <WorkerDashboard />
            : <Navigate to="/" />
        }
      />

      {/* 🛠 Admin */}
      <Route
        path="/admin/*"
        element={
          user?.role === "admin"
            ? <AdminDashboard />
            : <Navigate to="/" />
        }
      >
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="search" element={<AdminSearch />} />
        <Route path="leads" element={<AdminLeadHistory />} />
        <Route path="worker/edit/:id" element={<AdminWorkerEdit />} />
        <Route path="provider/edit/:id" element={<AdminProviderEdit />} />
        <Route path="contract/:id" element={<ContractManager />} />
        <Route path="pending-debug" element={<PendingWorkersDebug />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
