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
  // LOAD WORKERS
  // =====================

  const loadWorkers = async (showLoading = true) => {

    try {

      if (showLoading) {
        setLoading(true);
      }

      // pending
      const pSnap = await getDocs(
        collection(db, "pendingWorkers")
      );

      const pendingList = pSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: "pending",
      }));

      // approved
      const aSnap = await getDocs(
        query(
          collection(db, "workers"),
          where("status", "==", "approved")
        )
      );

      const approvedList = aSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: "approved",
      }));

      // expired
      const eSnap = await getDocs(
        query(
          collection(db, "workers"),
          where("status", "==", "expired")
        )
      );

      const expiredList = eSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: "expired",
      }));

      setPending(pendingList);
      setApproved(approvedList);
      setExpired(expiredList);

    } catch (err) {

      console.error("useWorkers error:", err);

    } finally {

      if (showLoading) {
        setLoading(false);
      }

    }

  };

  // =====================
  // AUTO EXPIRY CHECK
  // =====================

  const checkExpiry = async () => {

    try {

      const aSnap = await getDocs(
        query(
          collection(db, "workers"),
          where("status", "==", "approved")
        )
      );

      const approvedList = aSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const now = new Date();

      for (let w of approvedList) {

        if (!w.contractEnd) continue;

        const end = new Date(w.contractEnd);

        // expired
        if (end < now) {

          await updateDoc(doc(db, "workers", w.id), {
            status: "expired",
            approved: false,
            updatedAt: serverTimestamp(),
          });

        }

      }

      // 🔥 background refresh only
      await loadWorkers(false);

    } catch (err) {

      console.error("Expiry error:", err);

    }

  };

  // =====================
  // APPROVE WORKER
  // =====================

  const approvePendingWorker = async (
    workerId,
    great,
    contractEnd
  ) => {

    try {

      if (!great) {
        alert("Select Great ❌");
        return;
      }

      const ref = doc(db, "pendingWorkers", workerId);

      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Worker not found ❌");
        return;
      }

      const data = snap.data();

      let finalEnd = contractEnd;

      // auto duration
      if (!finalEnd) {

        const end = new Date();

        // A+ B+ C+ = 12 month
        if (["A+", "B+", "C+"].includes(great)) {

          end.setMonth(end.getMonth() + 12);

        } else {

          // A B C = 1 month
          end.setMonth(end.getMonth() + 1);

        }

        finalEnd = end.toISOString();

      }

      // save approved worker
      await setDoc(doc(db, "workers", workerId), {

        ...data,

        great,

        status: "approved",

        approved: true,

        approvalDate: new Date().toISOString(),

        contractEnd: finalEnd,

      });

      // remove pending
      await deleteDoc(ref);

      await loadWorkers(false);

      alert("Worker Approved ✅");

    } catch (err) {

      console.error(err);

      alert("Approval failed ❌");

    }

  };

  // =====================
  // EXTEND / RE-APPROVE
  // =====================

  const extendApprovedWorker = async (
    workerId,
    contractEnd
  ) => {

    try {

      let finalEnd = contractEnd;

      // normal extend
      if (!finalEnd) {

        const end = new Date();

        end.setMonth(end.getMonth() + 1);

        finalEnd = end.toISOString();

      }

      await updateDoc(doc(db, "workers", workerId), {

        status: "approved",

        approved: true,

        contractEnd: finalEnd,

        updatedAt: serverTimestamp(),

      });

      await loadWorkers(false);

      alert("Worker Re-Approved ✅");

    } catch (err) {

      console.error(err);

      alert("Extend Failed ❌");

    }

  };

  // =====================
  // DELETE
  // =====================

  const deleteWorker = async (id) => {

    try {

      await deleteDoc(doc(db, "workers", id));

      await loadWorkers(false);

    } catch (err) {

      console.error(err);

    }

  };

  // =====================
  // FIRST LOAD
  // =====================

  useEffect(() => {

    loadWorkers();

    // 🔥 ONLY expiry check
    // no full reload feel

    const interval = setInterval(() => {

      checkExpiry();

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

