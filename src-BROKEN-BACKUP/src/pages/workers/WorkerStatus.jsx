import { doc, updateDoc } from "firebase/firestore";
import { workersCollection, db } from "../../firebase/config";

export default function WorkerStatus({ worker }) {
  const toggleStatus = async () => {
    await updateDoc(doc(db, "workers", worker.id), { active: !worker.active });
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {worker.name} — Status: {worker.active ? "Active" : "Blocked"}
      <button onClick={toggleStatus} style={{ marginLeft: 10 }}>
        Toggle
      </button>
    </div>
  );
}
