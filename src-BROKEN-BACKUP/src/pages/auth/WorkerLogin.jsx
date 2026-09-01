import { useState } from "react";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function WorkerLogin() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone) return alert("Enter phone number");

    try {
      // 1️⃣ Check approved workers
      const workersQuery = query(
        collection(db, "workers"),
        where("phone", "==", phone)
      );
      const workersSnap = await getDocs(workersQuery);
      if (!workersSnap.empty) {
        const workerData = workersSnap.docs[0].data();
        localStorage.setItem("worker", JSON.stringify(workerData));
        login(workerData);
        navigate("/worker/dashboard");
        return;
      }

      // 2️⃣ Check pending workers
      const pendingQuery = query(
        collection(db, "pendingWorkers"),
        where("phone", "==", phone)
      );
      const pendingSnap = await getDocs(pendingQuery);
      if (!pendingSnap.empty) {
        const pendingData = pendingSnap.docs[0].data();
        alert("Admin approval pending");
        localStorage.setItem("worker", JSON.stringify(pendingData));
        login(pendingData);
        navigate("/worker/dashboard");
        return;
      }

      // 3️⃣ Check expired workers (if you have expireWorkers collection)
      const expiredQuery = query(
        collection(db, "expiredWorkers"),
        where("phone", "==", phone)
      );
      const expiredSnap = await getDocs(expiredQuery);
      if (!expiredSnap.empty) {
        const expiredData = expiredSnap.docs[0].data();
        alert("Your contract has expired");
        localStorage.setItem("worker", JSON.stringify(expiredData));
        login(expiredData);
        navigate("/worker/dashboard");
        return;
      }

      // 4️⃣ Not found anywhere
      alert("Worker not found");
    } catch (err) {
      console.error(err);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Worker Login</h2>

      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
