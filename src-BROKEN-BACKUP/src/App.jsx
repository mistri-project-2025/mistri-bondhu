import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// 🌐 Public Pages
import Home from "./pages/Home";
import RoleSelector from "./pages/auth/RoleSelector";
import Signup from "./pages/auth/Signup";
import Login from "./pages/Login";
import WorkerLogin from "./pages/auth/WorkerLogin";

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
import WorkerGroupPro from "./pages/admin/workers/WorkerGroupPro";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminSearch from "./pages/admin/AdminSearch";
import AdminWorkerEdit from "./pages/admin/AdminWorkerEdit";
import AdminProviderEdit from "./pages/admin/AdminProviderEdit";
import ContractManager from "./pages/admin/ContractManager";
import AdminLeadHistory from "./pages/admin/AdminLeadHistory";
import AdminLeadActivities from "./pages/admin/AdminLeadActivities"; // ✅ NEW
import PendingWorkersDebug from "./pages/admin/PendingWorkersDebug";
import FixGroups from "./pages/admin/tools/FixGroups";

// 🆕 FOOTER SYSTEM
import FooterPage from "./pages/FooterPage";
import AdminFooterContent from "./pages/admin/AdminFooterContent";

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>

      {/* 🌐 PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/role" element={<RoleSelector />} />
      <Route path="/signup/:role" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/worker/login" element={<WorkerLogin />} />
      <Route path="/logout" element={<Logout />} />

      {/* 🆕 FOOTER (USER PAGE) */}
      <Route path="/footer" element={<FooterPage />} />

      {/* 🧑‍💼 PROVIDER */}                 
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

      {/* 👷 WORKER */}
      <Route
        path="/worker/dashboard"
        element={
          user?.role === "worker"
            ? <WorkerDashboard />
            : <Navigate to="/" />
        }
      />

      {/* 🛠 ADMIN */}
      <Route
        path="/admin/*"
        element={
          user?.role === "admin"
            ? <AdminDashboard />
            : <Navigate to="/" />
        }
      >
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="workers/groups" element={<WorkerGroupPro />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="search" element={<AdminSearch />} />
        <Route path="leads" element={<AdminLeadHistory />} />
        <Route path="activities" element={<AdminLeadActivities />} /> {/* ✅ NEW - Worker কখন Lead দেখলো */}
        <Route path="worker/edit/:id" element={<AdminWorkerEdit />} />
        <Route path="provider/edit/:id" element={<AdminProviderEdit />} />
        <Route path="contract/:id" element={<ContractManager />} />
        <Route path="pending-debug" element={<PendingWorkersDebug />} />
        <Route path="fix-groups" element={<FixGroups />} />

        {/* 🆕 FOOTER ADMIN PAGE */}
        <Route path="footer" element={<AdminFooterContent />} />
      </Route>

      {/* ❌ CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
