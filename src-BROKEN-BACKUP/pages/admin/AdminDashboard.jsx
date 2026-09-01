import { useState } from "react";
import WorkerGroupPro from "./workers/WorkerGroupPro.jsx";

export default function AdminDashboard() {
  const [active, setActive] = useState("pro");

  const menu = [
    { id: "workers", label: "👷 Workers", color: "#fff" },
    { id: "pro", label: "👑 Worker Groups Pro", color: "#e3f2fd" },
    { id: "providers", label: "🏢 Providers", color: "#fff" },
    { id: "feedback", label: "💬 Feedback", color: "#fff" },
    { id: "search", label: "🔍 Search", color: "#fff" },
    { id: "leadHistory", label: "📜 Lead History", color: "#fff" },
    { id: "leadActivities", label: "📊 Lead Activities - Worker Tracking", color: "#c8e6c9", bold: true },
    { id: "fixGroups", label: "🔧 Fix Worker Groups", color: "#ffcdd2", bold: true },
    { id: "footer", label: "📄 Footer Content", color: "#fff" },
    { id: "logout", label: "🚪 Logout", color: "#fff" },
  ];

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", padding: 10, fontFamily: "Arial" }}>
      <h1 style={{ color: "#3f51b5", fontSize: 22, margin: "10px 0" }}>👑 Admin Dashboard</h1>
      
      <div style={{ background: "white", borderRadius: 8, padding: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        {menu.map(m => (
          <div key={m.id} onClick={() => setActive(m.id)}
            style={{ 
              padding: "10px 15px", margin: "4px 0", borderRadius: 5,
              background: m.id === active ? "#e3f2fd" : m.color,
              border: "1px solid #e0e0e0", cursor: "pointer",
              fontWeight: m.bold ? "bold" : "normal",
              color: m.bold ? "#1a237e" : "#333"
            }}>
            {m.label}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 15, background: "white", borderRadius: 8, padding: 15, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <h3>🔔 Provider Search Notifications</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button style={{ background: "#e8f5e9", border: "1px solid green", padding: "5px 10px" }}>✅ Mark all as read</button>
          <button style={{ background: "#ffebee", border: "1px solid red", padding: "5px 10px" }}>❌ Clear all</button>
        </div>
        <p style={{ color: "#666" }}>No provider search notifications</p>
      </div>

      {active === "pro" && <WorkerGroupPro />}
      {active !== "pro" && (
        <div style={{ marginTop: 15, background: "white", padding: 20, borderRadius: 8 }}>
          <h2>{menu.find(m=>m.id===active)?.label} - Coming Soon</h2>
          <p>এই Section টা {active} এর জন্য</p>
        </div>
      )}
    </div>
  );
}
