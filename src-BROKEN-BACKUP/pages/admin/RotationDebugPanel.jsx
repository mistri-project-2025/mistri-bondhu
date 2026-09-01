import { useState } from "react";
import { getNextWorkerGroup } from "../../firebase/rotationService";

export default function RotationDebugPanel({ workers }) {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState([]);

  const runTest = async () => {
    if (!workers?.length) return;

    const group = await getNextWorkerGroup(workers);

    setSelected(group);

    // simulate group preview (debug view)
    const groupSize = 5;
    const gradeWorkers = workers.filter(
      (w) => w.status === "approved"
    );

    const tempGroups = [];

    for (let i = 0; i < gradeWorkers.length; i += groupSize) {
      tempGroups.push(gradeWorkers.slice(i, i + groupSize));
    }

    setGroups(tempGroups);
  };

  return (
    <div style={{ padding: 20, border: "2px solid #ccc", marginTop: 20 }}>
      <h2>🔁 Rotation Debug Panel</h2>

      <button
        onClick={runTest}
        style={{
          padding: "8px 12px",
          background: "#1976D2",
          color: "#fff",
          border: "none",
          borderRadius: 6,
        }}
      >
        ▶ Run Rotation Test
      </button>

      <h3 style={{ marginTop: 20 }}>📦 All Groups</h3>

      {groups.map((g, i) => (
        <div
          key={i}
          style={{
            padding: 10,
            marginBottom: 10,
            border: "1px solid #999",
            borderRadius: 6,
            background: "#f9f9f9",
          }}
        >
          <b>Group {i + 1}</b> → {g.length} workers

          <ul>
            {g.map((w) => (
              <li key={w.id}>
                {w.name} ({w.great || "N/A"})
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3>📤 Selected Group (Sending)</h3>

      <div style={{ border: "2px solid green", padding: 10 }}>
        {selected.map((w) => (
          <div key={w.id}>
            👤 {w.name} - {w.phone}
          </div>
        ))}
      </div>
    </div>
  );
}
