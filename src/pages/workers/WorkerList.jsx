import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import WorkerCalendar from "./WorkerCalendar";

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Fetch active workers
  useEffect(() => {
    const fetchWorkers = async () => {
      const q = query(collection(db, "workers"), where("approved", "==", true));
      const snap = await getDocs(q);
      const now = new Date();

      const activeWorkers = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((w) => !w.contractEnd || new Date(w.contractEnd) >= now);

      setWorkers(activeWorkers);
    };

    fetchWorkers();

    const interval = setInterval(fetchWorkers, 60 * 1000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Workers</h2>
      {workers.length === 0 && <p>No active workers</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {workers.map((w) => (
          <div
            key={w.id}
            style={{
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
              textAlign: "center",
              backgroundColor: "#f8f8f8",
              cursor: "pointer",
            }}
            onClick={() => setSelectedWorker(w)}
          >
            <h4>{w.name}</h4>
            <p>Category: {w.category}</p>
            {w.contractEnd && (
              <p>Contract ends: {new Date(w.contractEnd).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>

      {/* Calendar Modal */}
      {selectedWorker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <button
            onClick={() => setSelectedWorker(null)}
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: 28,
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <WorkerCalendar worker={selectedWorker} onSaved={() => setSelectedWorker(null)} />
        </div>
      )}
    </div>
  );
}
