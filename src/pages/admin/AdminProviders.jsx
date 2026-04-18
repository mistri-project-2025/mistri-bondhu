// src/pages/admin/AdminProviders.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { sendLeadsToWorkers } from "../../firebase/adminLeads";

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [workers, setWorkers] = useState([]);

  // 🔹 Fetch providers
  useEffect(() => {
    const fetchProviders = async () => {
      const snap = await getDocs(collection(db, "providers"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProviders(data);
    };
    fetchProviders();
  }, []);

  // 🔹 Fetch approved workers
  useEffect(() => {
    const fetchWorkers = async () => {
      const snap = await getDocs(collection(db, "workers"));
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((w) => w.status === "approved");

      setWorkers(data);
    };
    fetchWorkers();
  }, []);

  // 🔥 GREAT ORDER SYSTEM
  const order = ["A+", "A", "B+", "B", "C+", "C"];

  // 🔥 GROUP SIZE RULE
  const sizeMap = {
    "A+": 4,
    "A": 4,
    "B+": 7,
    "B": 7,
    "C+": 10,
    "C": 10,
  };

  const handleSendLeads = (provider) => {
    const matchedWorkers = workers.filter(
      (w) => w.categoryId === provider.categoryId
    );

    if (matchedWorkers.length === 0) {
      alert("❌ No workers found for this category");
      return;
    }

    // 🔥 sort by GREAT priority
    matchedWorkers.sort(
      (a, b) => order.indexOf(a.great) - order.indexOf(b.great)
    );

    const great = matchedWorkers[0]?.great;
    const groupSize = sizeMap[great] || 5;

    // 🔥 group system (split into groups)
    const groups = [];
    for (let i = 0; i < matchedWorkers.length; i += groupSize) {
      groups.push(matchedWorkers.slice(i, i + groupSize));
    }

    // 🔥 send leads (2 workers per group)
    groups.forEach((group) => {
      const selected = group.slice(0, 2);
      sendLeadsToWorkers(provider, selected);
    });

    alert(`✅ Leads sent via GROUP system (${groups.length} groups)`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧑‍💼 Providers</h2>

      {providers.length === 0 && <p>No providers found</p>}

      {providers.map((provider) => (
        <div
          key={provider.id}
          style={{
            border: "1px solid #999",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
          }}
        >
          <b>{provider.name}</b>
          <p>📞 {provider.phone}</p>
          <p>📍 PIN: {provider.pincode}</p>
          <p>🛠 Category: {provider.categoryId}</p>

          <button
            onClick={() => handleSendLeads(provider)}
            style={{ marginTop: 6 }}
          >
            📤 Send Leads
          </button>
        </div>
      ))}
    </div>
  );
}
