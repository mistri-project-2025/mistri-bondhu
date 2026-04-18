import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCategoryLabel } from "../../utils/categories";

export default function AdminLeadHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/role");
      return;
    }

    const allLeads = JSON.parse(
      localStorage.getItem("mb_worker_leads") || "[]"
    );

    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    // 🔥 remove old leads
    const validLeads = allLeads.filter(
      (l) => now - new Date(l.contactedAt).getTime() <= THIRTY_DAYS
    );

    // 🔥 latest first
    validLeads.sort(
      (a, b) =>
        new Date(b.contactedAt).getTime() -
        new Date(a.contactedAt).getTime()
    );

    localStorage.setItem("mb_worker_leads", JSON.stringify(validLeads));
    setLeads(validLeads);
  }, [user, navigate]);

  if (!user || user.role !== "admin") {
    return <p>Admin login required</p>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h2>📊 Lead History</h2>
      <p style={{ color: "#555" }}>
        Provider → Worker contact history (last 30 days)
      </p>

      <hr />

      {leads.length === 0 && <p>No leads found 😕</p>}

      {leads.map((l) => (
        <div
          key={l.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          {/* Provider */}
          <h4>🧑‍💼 Provider</h4>
          <p><b>Name:</b> {l.providerName}</p>
          <p><b>Phone:</b> {l.providerPhone}</p>
          <p><b>Pincode:</b> {l.providerPincode}</p>

          <hr />

          {/* Worker */}
          <h4>👷 Worker</h4>
          <p><b>Name:</b> {l.workerName}</p>
          <p><b>Phone:</b> {l.workerPhone}</p>

          {/* 🔥 NEW ADD */}
          <p>
            <b>Category:</b>{" "}
            {getCategoryLabel(l.categoryId || l.category)}
          </p>

          <p>
            <b>Great:</b>{" "}
            <span style={{ color: "green", fontWeight: "bold" }}>
              {l.great || "N/A"}
            </span>
          </p>

          {/* Time */}
          <p style={{ marginTop: 8 }}>
            ⏰ <b>Contacted At:</b>{" "}
            {new Date(l.contactedAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
