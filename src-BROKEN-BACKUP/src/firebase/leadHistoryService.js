// src/firebase/leadHistoryService.js
import { db } from "./config";
import { collection, getDocs } from "firebase/firestore";

// GET HISTORY
export const getLeadHistory = async () => {
  const snap = await getDocs(collection(db, "leadHistory"));

  const history = [];

  snap.forEach((doc) => {
    history.push({ id: doc.id, ...doc.data() });
  });

  return history;
};
