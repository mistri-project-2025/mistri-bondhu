import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { workersCollection, db } from "../../firebase/config";

export default function PendingWorkers() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    getDocs(workersCollection).then((snap) => {
      const workers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPending(workers.filter((w) => !w.approved));
    });
  }, []);

  const approveWorker = async (id) => {
    await updateDoc(doc(db, "workers", id), { approved: true });
    setPending((p) => p.filter((w) => w.id !== id));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Pending Workers</h2>
      {pending.length === 0 ? (
        <p>No pending workers</p>
      ) : (
        pending.map((w) => (
          <div key={w.id} style={{ marginBottom: 12, border: "1px solid #ccc", padding: 12 }}>
            <strong>{w.name}</strong> — {w.category}
            <button onClick={() => approveWorker(w.id)} style={{ marginLeft: 12 }}>
              ✅ Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}
