// src/pages/provider/ProviderWorkerSearch.jsx
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { checkWorkerExpiry } from "../../utils/checkWorkerExpiry";

export default function ProviderWorkerSearch() {
  const [pincode, setPincode] = useState("");
  const [category, setCategory] = useState("");
  const [workers, setWorkers] = useState([]);

  const handleSearch = async () => {
    if (!category) {
      alert("Please select a category");
      return;
    }

    // ✅ check expiry before search
    await checkWorkerExpiry();

    // Build query conditions dynamically
    const conditions = [where("status", "==", "approved")];

    if (pincode) {
      conditions.push(where("pincode", "==", pincode));
    }

    if (category) {
      conditions.push(where("categoryId", "==", category));
    }

    const q = query(collection(db, "workers"), ...conditions);

    const snap = await getDocs(q);

    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setWorkers(list);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔎 Find Workers</h2>

      <input
        placeholder="Enter Pincode (optional)"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Enter Category (mason / electrician)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSearch}>
        Search Workers
      </button>

      <hr />

      {workers.length === 0 && <p>No workers found 😕</p>}

      {workers.map((w) => (
        <div
          key={w.id}
          style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}
        >
          <b>Name:</b> {w.name} <br />
          <b>Phone:</b> {w.phone} <br />
          <b>Pincode:</b> {w.pincode || "N/A"} <br />
          <b>Category:</b> {w.category}
        </div>
      ))}
    </div>
  );
}
