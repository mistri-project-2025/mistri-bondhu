// src/firebase/leadLimitService.js
import { db } from "./config";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// CHECK LIMIT (1 provider + 1 group = only 1 time)
export const canSendLead = async (providerId, group) => {
  const q = query(
    collection(db, "leadHistory"),
    where("providerId", "==", providerId),
    where("group", "==", group)
  );

  const snap = await getDocs(q);

  return snap.empty; // true = allowed, false = already used
};

// SAVE LEAD LOG
export const saveLeadHistory = async (providerId, group, workersCount) => {
  await addDoc(collection(db, "leadHistory"), {
    providerId,
    group,
    workersCount,
    sentAt: serverTimestamp(),
  });
};
