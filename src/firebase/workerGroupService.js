// src/firebase/workerGroupService.js
import { db } from "./config";
import { collection, getDocs } from "firebase/firestore";

// GET WORKERS BY GROUP
export const getWorkersByGroup = async (group) => {
  const snap = await getDocs(collection(db, "workers"));

  const workers = [];

  snap.forEach((doc) => {
    const data = doc.data();

    if (data.group === group && data.status === "approved") {
      workers.push({ id: doc.id, ...data });
    }
  });

  return workers;
};
