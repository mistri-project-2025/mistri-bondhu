import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

export const checkWorkerExpiry = async () => {

  const snap = await getDocs(collection(db, "workers"));
  const now = new Date();

  for (const d of snap.docs) {

    const data = d.data();

    if (data.status === "approved" && data.expiryAt) {

      const expiry = new Date(data.expiryAt);

      if (expiry < now) {

        await updateDoc(doc(db, "workers", d.id), {
          status: "expired"
        });

      }

    }

  }

};
