import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function WorkerCalendar({ worker, onSaved }) {
  const [contractEnd, setContractEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState("1m"); // default 1 minute

  const workerRef = doc(db, "workers", worker.id);

  // Load existing contract
  useEffect(() => {
    const fetchContract = async () => {
      const snap = await getDoc(workerRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.contractEnd) {
          setContractEnd(data.contractEnd);
        }
      }
      setLoading(false);
    };
    fetchContract();
  }, [workerRef]);

  // Save contract + approval
  const saveContract = async () => {
    setSaving(true);

    const now = new Date();
    let endDate = new Date(now);

    // ⏱️ duration logic
    if (duration === "1m") {
      endDate.setMinutes(endDate.getMinutes() + 1); // 1 minute
    } else {
      endDate.setMonth(endDate.getMonth() + parseInt(duration)); // months
    }

    const endDateISO = endDate.toISOString();

    await setDoc(
      workerRef,
      {
        contractEnd: endDateISO,
        approved: true,
        status: "approved",
      },
      { merge: true }
    );

    setSaving(false);
    alert("Worker approved 💚");

    if (onSaved) onSaved();
  };

  if (loading) return <p>Loading contract info...</p>;

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "0 auto" }}>
      <h3>{worker.name} – Approval</h3>

      {/* Duration select */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600 }}>Approval Time:</label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={{
            marginLeft: 10,
            padding: 8,
            fontSize: 16,
            width: "100%",
            marginTop: 6,
          }}
        >
          <option value="1m">⏱️ 1 Minute (Test)</option>

          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} Month{i > 0 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={saveContract}
        disabled={saving}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          cursor: "pointer",
          backgroundColor: "#1976D2",
          color: "#fff",
          border: "none",
          borderRadius: 6,
        }}
      >
        {saving ? "Saving..." : "Approve 💚"}
      </button>

      {contractEnd && (
        <p style={{ marginTop: 12, fontWeight: 500 }}>
          Contract ends on:{" "}
          {new Date(contractEnd).toLocaleString()}
        </p>
      )}
    </div>
  );
}
