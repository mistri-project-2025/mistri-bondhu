// ProviderDetails.jsx
import { useEffect, useState } from "react";
import { getWorkerDetails } from "../../firebase/search";

export default function ProviderDetails({ workerId }) {
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    if (!workerId) return;

    const loadWorker = async () => {
      try {
        const w = await getWorkerDetails(workerId);
        setWorker(w);
      } catch {
        setWorker(null);
      }
    };

    loadWorker();
  }, [workerId]);

  if (!worker) return <p>Worker not found</p>;

  return (
    <div style={{ background: "#fff", padding: 12, borderRadius: 6 }}>
      <b>{worker.name}</b>
      <p>📞 {worker.phone}</p>
      <p>🛠 {worker.categoryName}</p>
      <p>📍 {worker.pincode}</p>
      <p>Experience: {worker.experience} years</p>
    </div>
  );
}
