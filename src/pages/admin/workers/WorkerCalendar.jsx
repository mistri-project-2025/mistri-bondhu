import { useState } from "react";

export default function WorkerCalendar({
  worker,
  approvePendingWorker,
  extendApprovedWorker,
  isExtend,
  onClose,
}) {
  const [mode, setMode] = useState("normal");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    let contractEnd = null;

    if (mode === "test") {
      const end = new Date();
      end.setMinutes(end.getMinutes() + 1);
      contractEnd = end.toISOString();
    }

    if (isExtend) {
      await extendApprovedWorker(worker.id, contractEnd);
    } else {
      await approvePendingWorker(worker.id, worker.great, contractEnd);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000055" }}>
      <div
        style={{
          background: "#fff",
          padding: 20,
          margin: "10% auto",
          width: 300,
        }}
      >
        <h3>{isExtend ? "Extend" : "Approve"}</h3>

        <p>Great: {worker.great}</p>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="test">1 Minute Test</option>
        </select>

        <button onClick={submit} disabled={loading}>
          Submit
        </button>

        <button onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
