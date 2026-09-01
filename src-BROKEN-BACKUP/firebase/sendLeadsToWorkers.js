// src/firebase/sendLeadsToWorkers.js
import { db } from "./config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { canSendLead, saveLeadHistory } from "./leadLimitService";
import { getWorkersByGroup } from "./workerGroupService";

// MAIN FUNCTION
export const sendLeadsToWorkers = async (provider, group) => {
  const providerId = provider.id;

  // 1. CHECK LIMIT
  const allowed = await canSendLead(providerId, group);

  if (!allowed) {
    throw new Error("❌ This provider already sent lead to this group");
  }

  // 2. GET ALL WORKERS IN GROUP
  const workers = await getWorkersByGroup(group);

  if (workers.length === 0) {
    throw new Error("❌ No workers found in this group");
  }

  // 3. SEND LEAD TO ALL WORKERS
  const promises = workers.map((worker) =>
    addDoc(collection(db, "leads"), {
      providerId,
      workerId: worker.id,
      group,
      category: provider.category,
      sentAt: serverTimestamp(),
    })
  );

  await Promise.all(promises);

  // 4. SAVE HISTORY
  await saveLeadHistory(providerId, group, workers.length);

  return {
    success: true,
    sentTo: workers.length,
  };
};
