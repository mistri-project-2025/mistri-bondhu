// src/pages/admin/AdminProviders.jsx

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

import { sendLeadsToWorkers } from "../../firebase/adminLeads";

import RotationDebugPanel from "./RotationDebugPanel";
import RotationStatusPanel from "./RotationStatusPanel";

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showProviders, setShowProviders] = useState(true);
  const [showRotationStatus, setShowRotationStatus] = useState(false);
  const [showRotationDebug, setShowRotationDebug] = useState(false);

  // =========================
  // FETCH PROVIDERS
  // =========================
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const snap = await getDocs(collection(db, "providers"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProviders(data);
      } catch (err) {
        console.error("Provider Fetch Error:", err);
      }
    };

    fetchProviders();
  }, []);

  // =========================
  // FETCH APPROVED WORKERS
  // =========================
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const snap = await getDocs(collection(db, "workers"));

        const data = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((w) => w.status === "approved");

        setWorkers(data);
      } catch (err) {
        console.error("Worker Fetch Error:", err);
      }
    };

    fetchWorkers();
  }, []);

  // =========================
  // SEND LEADS
  // =========================
  const handleSendLeads = async (provider) => {
    try {
      setLoading(true);

      console.log("PROVIDER:", provider);
      console.log("ALL WORKERS:", workers);

      const result = await sendLeadsToWorkers(provider, workers);

      if (result?.success) {
        alert(
          `✅ Leads sent successfully (${result.sentTo} workers)`
        );
      } else {
        alert("❌ Lead send failed or no group found");
      }
    } catch (err) {
      console.error("Lead Send Error:", err);
      alert("❌ Failed to send leads");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧑‍💼 Providers Dashboard</h2>

      {/* CONTROL BUTTONS */}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() =>
            setShowProviders(!showProviders)
          }
        >
          {showProviders
            ? "❌ Close Providers"
            : "🧑‍💼 Providers"}
        </button>

        <button
          onClick={() =>
            setShowRotationStatus(
              !showRotationStatus
            )
          }
        >
          {showRotationStatus
            ? "❌ Close Rotation Status"
            : "📊 Rotation Status"}
        </button>

        <button
          onClick={() =>
            setShowRotationDebug(
              !showRotationDebug
            )
          }
        >
          {showRotationDebug
            ? "❌ Close Rotation Debug"
            : "🔁 Rotation Debug"}
        </button>
      </div>

      {/* PROVIDERS */}

      {showProviders && (
        <div>
          <h3>🧑‍💼 Providers List</h3>

          {providers.length === 0 && (
            <p>No providers found</p>
          )}

          {providers.map((provider) => (
            <div
              key={provider.id}
              style={{
                border: "1px solid #999",
                padding: 12,
                marginBottom: 12,
                borderRadius: 8,
                background: "#fff",
              }}
            >
              <b>{provider.name}</b>

              <p>📞 {provider.phone}</p>

              <p>
                📍 PIN:{" "}
                {provider.pincode || "-"}
              </p>

              <p>
                🛠 Category:{" "}
                {provider.categoryId}
              </p>

              <button
                disabled={loading}
                onClick={() =>
                  handleSendLeads(provider)
                }
              >
                {loading
                  ? "Sending..."
                  : "📤 Send Leads"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ROTATION STATUS */}

      {showRotationStatus && (
        <RotationStatusPanel
          workers={workers}
        />
      )}

      {/* ROTATION DEBUG */}

      {showRotationDebug && (
        <RotationDebugPanel
          workers={workers}
        />
      )}
    </div>
  );
}
