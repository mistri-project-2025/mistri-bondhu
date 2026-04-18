// src/pages/admin/workers/hooks/useWorkers.js

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../../firebase/config";

export default function useWorkers() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================
  // 🔥 EXPIRY CHECK
  // =====================
  const checkExpiry = async (workers) => {
    const now = new Date();

    for (let w of workers) {
      if (!w.contractEnd) continue;

      const end = new Date(w.contractEnd);

      if (end < now && w.status === "approved") {
        await updateDoc(doc(db, "workers", w.id), {
          status: "expired",
          updatedAt: serverTimestamp(),
        });
      }
    }
  };

  // =====================
  // 🔥 LOAD WORKERS
  // =====================
  const loadWorkers = async () => {
    try {
      setLoading(true);

      const pSnap = await getDocs(collection(db, "pendingWorkers"));
      const pendingList = pSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: "pending",
      }));

      const aSnap = await getDocs(
        query(collection(db, "workers"), where("status", "==", "approved"))
      );

      const approvedList = aSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: "approved",
      }));

      const eSnap = await getDocs(
        query(collection(db, "workers"), where("status", "==", "expired"))
      );

      const expiredList = eSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: "expired",
      }));

      await checkExpiry(approvedList);

      setPending(pendingList);
      setApproved(approvedList);
      setExpired(expiredList);
    } catch (err) {
      console.error("useWorkers error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // 🔥 APPROVE WORKER
  // =====================
  const approvePendingWorker = async (workerId, great, contractEnd) => {
    try {
      if (!great) return alert("Select Great ❌");

      const ref = doc(db, "pendingWorkers", workerId);
      const snap = await getDoc(ref);

      if (!snap.exists()) return alert("Worker not found ❌");

      const data = snap.data();

      let finalEnd = contractEnd;

      // 🔥 AUTO RULE
      if (!finalEnd) {
        const end = new Date();

        if (["A+", "B+", "C+"].includes(great)) {
          end.setMonth(end.getMonth() + 12);
        } else {
          end.setMonth(end.getMonth() + 1);
        }

        finalEnd = end.toISOString();
      }

      await setDoc(doc(db, "workers", workerId), {
        ...data,
        great,
        status: "approved",
        approved: true,
        approvalDate: new Date().toISOString(),
        contractEnd: finalEnd,
      });

      await deleteDoc(ref);
      await loadWorkers();

      alert("Worker Approved ✅");
    } catch (err) {
      console.error(err);
      alert("Approval failed ❌");
    }
  };

  // =====================
  // 🔥 EXTEND
  // =====================
  const extendApprovedWorker = async (workerId, contractEnd) => {
    try {
      await updateDoc(doc(db, "workers", workerId), {
        contractEnd,
        updatedAt: serverTimestamp(),
      });

      await loadWorkers();
      alert("Extended ✅");
    } catch (err) {
      console.error(err);
    }
  };

  // =====================
  // 🔥 DELETE
  // =====================
  const deleteWorker = async (id) => {
    await deleteDoc(doc(db, "workers", id));
    await loadWorkers();
  };

  // =====================
  // 🔥 AUTO REFRESH (SAFE)
  // =====================
  useEffect(() => {
    loadWorkers();

    const interval = setInterval(() => {
      loadWorkers(); // only data refresh, no UI reset problem
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    pending,
    approved,
    expired,
    loading,
    approvePendingWorker,
    extendApprovedWorker,
    deleteWorker,
    reload: loadWorkers,
  };
}
