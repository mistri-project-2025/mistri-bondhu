import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

// -------------------- PROVIDER SEARCH --------------------
export async function providerSearchWorkers(provider, categoryId) {
  if (!provider || provider.role !== "provider") return [];

  try {
    const workersRef = collection(db, "workers");
    const q = query(
      workersRef,
      where("status", "==", "approved"),
      where("categoryId", "==", categoryId)
    );

    const snapshot = await getDocs(q);

    const workers = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    // Admin notification
    const notificationsCol = collection(db, "adminNotifications");
    await addDoc(notificationsCol, {
      type: "PROVIDER_SEARCH",
      title: "New Provider Search",
      message: `${provider.name} searched workers (${categoryId})`,
      provider: { name: provider.name, phone: provider.phone, pincode: provider.pincode },
      createdAt: serverTimestamp(),
      read: false,
    });

    return workers;
  } catch (err) {
    console.error("Error fetching workers:", err);
    return [];
  }
}

// -------------------- RECORD CONTACT --------------------
export async function recordProviderContact(provider, workers) {
  if (!provider || provider.role !== "provider") return;

  try {
    const contactsCol = collection(db, "providerContacts");
    const now = serverTimestamp();

    for (let w of workers.slice(0, 5)) {
      await addDoc(contactsCol, {
        providerPhone: provider.phone,
        providerName: provider.name,
        workerId: w.id,
        workerName: w.name,
        contactedAt: now,
      });
    }
  } catch (err) {
    console.error("Error recording provider contact:", err);
  }
}
