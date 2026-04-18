import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCategoryLabel } from "../../utils/categories";

export default function AdminSearch() {
  const { user } = useAuth();

  const [searchLogs, setSearchLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    // ✅ Provider search logs
    const logs = JSON.parse(
      localStorage.getItem("mb_provider_search_logs") || "[]"
    );
    setSearchLogs(logs);

    // ✅ Admin notifications
    const noti = JSON.parse(
      localStorage.getItem("mb_admin_notifications") || "[]"
    );
    setNotifications(noti);
  }, [user]);

  if (!user || user.role !== "admin") {
    return <p>Admin login required</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🔍 Admin Search Monitor</h2>

      {/* ================= SEARCH LOGS ================= */}
      <hr />
      <h3>📜 Provider Search Logs</h3>

      {searchLogs.length === 0 && (
        <p>No provider searches yet.</p>
      )}

      {searchLogs.map((l) => (
        <div
          key={l.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            background: "#fafafa",
          }}
        >
          <b>🧑‍💼 Provider:</b> {l.providerName} <br />
          <b>📞 Phone:</b> {l.providerPhone} <br />
          <b>📍 PIN:</b> {l.providerPincode} <br />
          <b>🛠 Category:</b>{" "}
          {getCategoryLabel(l.searchedCategory)} <br />
          <b>⏰ Time:</b>{" "}
          {new Date(l.searchedAt).toLocaleString()}
        </div>
      ))}

      {/* ================= NOTIFICATIONS ================= */}
      <hr />
      <h3>🔔 Admin Notifications</h3>

      {notifications.length === 0 && (
        <p>No notifications</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            border: "1px dashed #999",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            background: n.read ? "#f9f9f9" : "#fffbe6",
          }}
        >
          <b>{n.title}</b>
          <p>{n.message}</p>
          <p>
            ⏰ {new Date(n.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
