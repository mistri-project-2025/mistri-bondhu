import { useState } from "react";
import { approveWorker, expireWorker } from "./workers/services/workerService";

export default function ContractManager({ worker, onClose }) {
  const [loading, setLoading] = useState(false);

  // 🔥 FORCE EXPIRE
  const handleExpire = async () => {
    if (!window.confirm("Expire this worker?")) return;

    try {
      setLoading(true);
      await expireWorker(worker.id);
      setLoading(false);
      alert("Worker expired ❌");
      onClose();
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  // 🔥 RE-APPROVE (same great)
  const handleReapprove = async () => {
    try {
      setLoading(true);
      await approveWorker(worker.id, worker.great);
      setLoading(false);
      alert("Worker re-approved ✅");
      onClose();
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #333",
        padding: 15,
        marginTop: 10,
        borderRadius: 8,
        background: "#fafafa",
      }}
    >
      <h4>📜 Contract Manager</h4>

      <p><b>Name:</b> {worker.name}</p>
      <p><b>Great:</b> {worker.great}</p>
      <p><b>Status:</b> {worker.status}</p>

      <p>
        <b>Expiry:</b>{" "}
        {worker.contractEnd
          ? new Date(worker.contractEnd).toLocaleDateString()
          : "N/A"}
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        
        {/* 🔄 RE-APPROVE */}
        {(worker.status === "expired" || worker.status === "pending") && (
          <button onClick={handleReapprove} disabled={loading}>
            🔄 Re-Approve
          </button>
        )}

        {/* ❌ FORCE EXPIRE */}
        {worker.status === "approved" && (
          <button onClick={handleExpire} disabled={loading}>
            ❌ Expire Now
          </button>
        )}

        {/* CLOSE */}
        <button onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
