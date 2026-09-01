import { useState } from "react";

export default function WorkerCalendar({
  worker,
  approvePendingWorker,
  extendApprovedWorker,
  isExtend,
  onClose,
}) {
  const [mode, setMode] = useState("normal");
  const [great, setGreat] = useState(worker.great || "C");
  const [loading, setLoading] = useState(false);

  const months = great.includes("+")? 12 : 1;
  const today = new Date();
  const expireDate = new Date();
  if (mode === "test") {
    expireDate.setMinutes(expireDate.getMinutes() + 1);
  } else {
    expireDate.setMonth(expireDate.getMonth() + months);
  }

  const days = Math.ceil((expireDate - today) / (1000*60*60*24));

  const submit = async () => {
    setLoading(true);
    let contractEnd = expireDate.toISOString();
    try {
      if (isExtend) {
        await extendApprovedWorker(worker.id, contractEnd, great);
      } else {
        await approvePendingWorker(worker.id, great, contractEnd);
      }
      onClose();
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 12, width: 350 }}>
        <h3>{isExtend? "⏳ Extend / Change Great" : "📅 Approve Worker"}</h3>
        <p>👤 {worker.name}</p>

        <label style={{ fontWeight: "bold", fontSize: 12 }}>⭐ Great Change:</label>
        <select value={great} onChange={(e) => setGreat(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 6, border: "2px solid #2196F3", marginBottom: 10 }}>
          <option value="A+">A+ (12 মাস)</option>
          <option value="A">A (1 মাস)</option>
          <option value="B+">B+ (12 মাস)</option>
          <option value="B">B (1 মাস)</option>
          <option value="C+">C+ (12 মাস)</option>
          <option value="C">C (1 মাস)</option>
        </select>

        <div style={{ background: great.includes("+")? "#e8f5e9" : "#fff3e0", padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <p style={{ margin: 0 }}>📅 Approval: {today.toLocaleDateString()}</p>
          <p style={{ margin: 0 }}>⏰ Expire: {expireDate.toLocaleString()}</p>
          <p style={{ margin: 0, fontWeight: "bold" }}>📊 {mode==="test"? "1 মিনিট Test" : `${months} মাস - ${days} দিন`}</p>
          <p style={{ margin: 0, fontSize: 12 }}>{great.includes("+")? "✅ A+,B+,C+ = 12 মাস পরে Expire" : "⚠️ A,B,C = 1 মাস পরে Expire"}</p>
        </div>

        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, marginBottom: 10 }}>
          <option value="normal">Normal - {months} মাস</option>
          <option value="test">1 Minute Test</option>
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={submit} disabled={loading} style={{ flex: 1, padding: 12, background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold" }}>{loading? "Loading..." : isExtend? "✅ Update & Extend" : "✅ Approve"}</button>
          <button onClick={onClose} style={{ flex: 1, padding: 12, background: "#999", color: "#fff", border: "none", borderRadius: 8 }}>❌ Close</button>
        </div>
      </div>
    </div>
  );
}
