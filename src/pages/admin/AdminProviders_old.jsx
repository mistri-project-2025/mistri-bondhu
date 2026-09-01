// src/pages/admin/AdminProviders.jsx

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

// ❌ পুরানোটা delete করো
// import { sendLeadsToWorkers } from "../../firebase/adminLeads";

// ✅ নতুন import
import { sendLeadAuto, sendLeadManual, getRotationStatus } from "../../utils/leadRotation";

import RotationDebugPanel from "./RotationDebugPanel";
import RotationStatusPanel from "./RotationStatusPanel";

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rotationInfo, setRotationInfo] = useState(null);

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
  // FETCH ROTATION STATUS
  // =========================
  useEffect(() => {
    const fetchRotation = async () => {
      const status = await getRotationStatus("civil_contractor");
      setRotationInfo(status);
    };
    fetchRotation();
  }, [loading]); // lead send এর পর refresh হবে

  // =========================
  // SEND LEADS - AUTO
  // =========================
  const handleSendLeadsAuto = async (provider) => {
    try {
      setLoading(true);

      // 👇 Provider data map করো
      const providerData = {
        providerId: provider.id,
        providerName: provider.name || "Unknown",
        providerPhone: provider.phone,
        providerPincode: provider.pincode || "700001",
        searchedCategory: provider.categoryId || provider.category // 👈 এটা check করো
      };

      console.log("PROVIDER DATA:", providerData);

      const result = await sendLeadAuto(providerData);

      if (result?.success) {
        alert(result.message);
      } else {
        alert(result.message || "❌ Lead send failed");
      }
    } catch (err) {
      console.error("Lead Send Error:", err);
      alert("❌ Failed to send leads: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEND LEADS - MANUAL
  // =========================
  const handleSendLeadsManual = async (provider) => {
    try {
      const groupNo = prompt("Group No? (1/2/3)");
      if (!groupNo) return;

      const great = prompt("Great? (A+/A/B+/B/C+/C)");
      if (!great) return;

      setLoading(true);

      const providerData = {
        providerId: provider.id,
        providerName: provider.name || "Unknown",
        providerPhone: provider.phone,
        providerPincode: provider.pincode || "700001",
        searchedCategory: provider.categoryId || provider.category
      };

      const result = await sendLeadManual(providerData, groupNo, great);

      if (result?.success) {
        alert(result.message);
      } else {
        alert(result.message || "❌ Lead send failed");
      }
    } catch (err) {
      console.error("Lead Send Error:", err);
      alert("❌ Failed to send leads: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧑‍💼 Providers Dashboard</h2>

      {/* ROTATION INFO */}
      {rotationInfo && (
        <div style={{
          background: "#e3f2fd",
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
          border: "2px solid #2196f3"
        }}>
          <b>🔄 Current Rotation:</b> {rotationInfo.current.groupNo}{rotationInfo.current.great}
          {" → "}
          <b>Next:</b> {rotationInfo.next.groupNo}{rotationInfo.next.great}
        </div>
      )}

      {/* CONTROL BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <button onClick={() => setShowProviders(!showProviders)}>
          {showProviders? "❌ Close Providers" : "🧑‍💼 Providers"}
        </button>

        <button onClick={() => setShowRotationStatus(!showRotationStatus)}>
          {showRotationStatus? "❌ Close Rotation Status" : "📊 Rotation Status"}
        </button>

        <button onClick={() => setShowRotationDebug(!showRotationDebug)}>
          {showRotationDebug? "❌ Close Rotation Debug" : "🔁 Rotation Debug"}
        </button>
      </div>

      {/* PROVIDERS */}
      {showProviders && (
        <div>
          <h3>🧑‍💼 Providers List</h3>

          {providers.length === 0 && <p>No providers found</p>}

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
              <p>📍 PIN: {provider.pincode || "-"}</p>
              <p>🛠 Category: {provider.categoryId || provider.category || "-"}</p>

              {/* 👇 দুটো Button */}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  disabled={loading}
                  onClick={() => handleSendLeadsAuto(provider)}
                  style={{
                    background: "#2196f3",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 4,
                    cursor: loading? "not-allowed" : "pointer"
                  }}
                >
                  {loading? "Sending..." : "📤 Send Auto"}
                </button>

                <button
                  disabled={loading}
                  onClick={() => handleSendLeadsManual(provider)}
                  style={{
                    background: "#4caf50",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 4,
                    cursor: loading? "not-allowed" : "pointer"
                  }}
                >
                  {loading? "Sending..." : "📤 Manual Select"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROTATION STATUS */}
      {showRotationStatus && <RotationStatusPanel workers={workers} />}

      {/* ROTATION DEBUG */}
      {showRotationDebug && <RotationDebugPanel workers={workers} />}
    </div>
  );
}
