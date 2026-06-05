import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { getNextWorkerGroup } from "./rotationService";

export async function sendLeadsToWorkers(provider, workers) {
  try {
    if (!provider || !workers.length) return;

    const categoryWorkers = workers.filter(
      (w) =>
        w.categoryId === provider.categoryId &&
        w.status === "approved"
    );

    const selectedGroup =
      await getNextWorkerGroup(categoryWorkers);

    for (let w of selectedGroup) {
      await addDoc(collection(db, "leads"), {
        providerId: provider.uid || provider.id || provider.phone,
        workerId: w.uid || w.id,

        category: provider.category,
        categoryId: provider.categoryId,

        great: w.great,
        status: "sent",

        contactedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    }

    return {
      success: true,
      sentTo: selectedGroup.length,
    };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}
