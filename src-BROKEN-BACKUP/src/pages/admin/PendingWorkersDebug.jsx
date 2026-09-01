import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function PendingWorkersDebug() {
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingWorkers = async () => {
      setLoading(true);
      try {
        // Directly fetch from Firestore without auth rules (use Admin SDK in server later)
        const snap = await getDocs(collection(db, "pendingWorkers"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log("Fetched pending workers:", list);
        setPendingWorkers(list);
      } catch (err) {
        console.error("Error fetching pending workers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWorkers();
  }, []);

  if (loading) return <p>Loading pending workers...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📝 Pending Workers Debug</h2>
      {pendingWorkers.length === 0 ? (
        <p>No pending workers found.</p>
      ) : (
        <ul>
          {pendingWorkers.map(w => (
            <li key={w.id}>
              <strong>{w.name}</strong> - {w.phone} - {w.status} - UID: {w.uid}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
