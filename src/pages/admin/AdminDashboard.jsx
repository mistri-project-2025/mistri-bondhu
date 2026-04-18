// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCategoryLabel } from "../../utils/categories";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/role");
      return;
    }

    const noti = JSON.parse(
      localStorage.getItem("mb_admin_notifications") || "[]"
    );
    setNotifications(noti);
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  // ✅ Logout Function (Dashboard Button থেকে)
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase logout
      logout();            // Context logout (localStorage clear)
      navigate("/");       // Home page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(
      "mb_admin_notifications",
      JSON.stringify(updated)
    );
  };

  const clearAll = () => {
    if (!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
    localStorage.setItem("mb_admin_notifications", JSON.stringify([]));
  };

  const providerSearchNoti = notifications.filter(
    (n) => n.type === "PROVIDER_SEARCH"
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>👑 Admin Dashboard</h1>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 30,
        }}
      >
        <button onClick={() => navigate("/admin/workers")}>
          👷 Workers
        </button>
        <button onClick={() => navigate("/admin/providers")}>
          🧑‍💼 Providers
        </button>
        <button onClick={() => navigate("/admin/feedback")}>
          💬 Feedback
        </button>
        <button onClick={() => navigate("/admin/search")}>
          🔍 Search
        </button>
        <button onClick={() => navigate("/admin/leads")}>
          📊 Lead History
        </button>

        {/* ✅ Direct Logout Button */}
        <button onClick={handleLogout} style={{ marginTop: 10 }}>
          🚪 Logout
        </button>
      </div>

      <hr />

      {/* Notifications */}
      <h3>🔔 Provider Search Notifications</h3>
      <div style={{ marginBottom: 10 }}>
        <button onClick={markAllRead}>✅ Mark all as read</button>{" "}
        <button onClick={clearAll}>❌ Clear all</button>
      </div>

      {providerSearchNoti.length === 0 && (
        <p>No provider search notifications</p>
      )}

      {providerSearchNoti.map((n) => (
        <div
          key={n.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            background: n.read ? "#f9f9f9" : "#fff3cd",
          }}
        >
          <b>👤 Provider:</b> {n.providerName} <br />
          <b>📞 Phone:</b> {n.providerPhone} <br />
          <b>📍 Pincode:</b> {n.providerPincode} <br />
          <b>🔍 Category:</b>{" "}
          {getCategoryLabel(n.searchedCategory)} <br />
          <b>⏰ Time:</b>{" "}
          {new Date(n.createdAt).toLocaleString()} <br />
          <b>Status:</b> {n.read ? "✅ Read" : "🔴 New"}
        </div>
      ))}

      <hr />

      {/* Nested Route Render */}
      <Outlet />
    </div>
  );
}
