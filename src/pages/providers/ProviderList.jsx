// ProviderList.jsx
import { useEffect, useState } from "react";
import { getApprovedWorkers } from "../../firebase/search"; // Firestore fetch helper
import { getCategoryLabel } from "../../utils/categories";

export default function ProviderList({ provider }) {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    if (!provider?.categoryId) return;

    const loadWorkers = async () => {
      try {
        const data = await getApprovedWorkers(provider.categoryId);
        setWorkers(data || []);
      } catch (err) {
        console.error("Failed to load workers:", err);
        setWorkers([]);
      }
    };

    loadWorkers();
  }, [provider]);

  if (!workers.length) return <p style={{ textAlign: "center" }}>No approved worker found</p>;

  return (
    <div>
      {workers.map((w) => (
        <div key={w.id} style={{ background: "#fff", padding: 12, marginBottom: 8, borderRadius: 6 }}>
          <b>{w.name}</b>
          <p>📞 {w.phone}</p>
          <p>🛠 {getCategoryLabel(w.categoryId)}</p>
          <p>📍 {w.pincode}</p>
        </div>
      ))}
    </div>
  );
}
