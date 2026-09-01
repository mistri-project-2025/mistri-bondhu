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
import { getNextGroupData } from "../../../../firebase/groupBuilderService";

export default function useWorkers() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const pSnap = await getDocs(collection(db, "pendingWorkers"));
      const pendingList = pSnap.docs.map((d) => ({ id: d.id,...d.data(), status: "pending" }));
      const aSnap = await getDocs(query(collection(db, "workers"), where("status", "==", "approved")));
      const approvedList = aSnap.docs.map((d) => ({ id: d.id,...d.data(), status: "approved" }));
      const eSnap = await getDocs(query(collection(db, "workers"), where("status", "==", "expired")));
      const expiredList = eSnap.docs.map((d) => ({ id: d.id,...d.data(), status: "expired" }));
      setPending(pendingList);
      setApproved(approvedList);
      setExpired(expiredList);
    } catch (err) {
      console.error("useWorkers error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const checkExpiry = async () => {
    try {
      const aSnap = await getDocs(query(collection(db, "workers"), where("status", "==", "approved")));
      const approvedList = aSnap.docs.map((d) => ({ id: d.id,...d.data() }));
      const now = new Date();
      for (let w of approvedList) {
        if (!w.contractEnd) continue;
        const end = new Date(w.contractEnd);
        if (end < now) {
          await updateDoc(doc(db, "workers", w.id), {
            status: "expired",
            approved: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
      await loadWorkers(false);
    } catch (err) {
      console.error("Expiry error:", err);
    }
  };

  // FIXED - Approval Fail Fix
  const approvePendingWorker = async (workerId, great, contractEnd) => {
    try {
      if (!great) { alert("Select Great ❌"); return; }
      const ref = doc(db, "pendingWorkers", workerId);
      const snap = await getDoc(ref);
      if (!snap.exists()) { alert("Worker not found ❌"); return; }
      const data = snap.data();

      // FIX - categoryId বের করো - পুরানো File এ categoryId ছিল, নতুন File এ categoryIds Array
      const catId = data.categoryId || (data.categoryIds && data.categoryIds[0]) || (data.categories && data.categories[0]);

      console.log("Approving with catId:", catId, "Data:", data);

      if (!catId) {
        alert("❌ Category পাওয়া যায়নি! Worker Data দেখো: " + JSON.stringify(data));
        return;
      }

      const groupData = await getNextGroupData(catId, great);
      let finalEnd = contractEnd;
      if (!finalEnd) {
        const end = new Date();
        if (great.includes("+")) { end.setMonth(end.getMonth() + 12); } else { end.setMonth(end.getMonth() + 1); }
        finalEnd = end.toISOString();
      }
      await setDoc(doc(db, "workers", workerId), {
       ...data,
        categoryId: catId,
        great,
        groupNo: groupData.groupNo,
        groupLabel: groupData.groupLabel,
        status: "approved",
        approved: true,
        approvalDate: new Date().toISOString(),
        contractEnd: finalEnd,
      });
      await deleteDoc(ref);
      await loadWorkers(false);
      alert("Worker Approved + Group Assigned ✅");
    } catch (err) {
      console.error("Approval Full Error:", err);
      alert("Approval failed ❌: " + err.message);
    }
  };

  const extendApprovedWorker = async (workerId, contractEnd, great) => {
    try {
      const workerRef = doc(db, "workers", workerId);
      const workerSnap = await getDoc(workerRef);
      if (!workerSnap.exists()) { alert("Worker not found ❌"); return; }
      const workerData = workerSnap.data();
      const oldGreat = workerData.great;
      const finalGreat = great || workerData.great;
      let finalEnd = contractEnd;
      if (!finalEnd) {
        const end = new Date();
        if (finalGreat.includes("+")) { end.setMonth(end.getMonth() + 12); } else { end.setMonth(end.getMonth() + 1); }
        finalEnd = end.toISOString();
      }
      const updateData = {
        status: "approved",
        approved: true,
        contractEnd: finalEnd,
        updatedAt: serverTimestamp(),
      };
      if (great && great!== oldGreat) {
        updateData.great = great;
        const catId = workerData.categoryId || (workerData.categoryIds && workerData.categoryIds[0]);
        if (catId) {
          const groupData = await getNextGroupData(catId, great);
          updateData.groupNo = groupData.groupNo;
          updateData.groupLabel = groupData.groupLabel;
        }
      }
      await updateDoc(workerRef, updateData);
      await loadWorkers(false);
      alert("Worker Updated Successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Extend Failed ❌: " + err.message);
    }
  };

  const deleteWorker = async (id) => {
    try {
      await deleteDoc(doc(db, "workers", id));
      await loadWorkers(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWorkers();
    const interval = setInterval(() => { checkExpiry(); }, 30000);
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
