import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export default function useProviderWorkers(categoryId) {

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!categoryId) {
      setWorkers([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "workers"),
      where("status", "==", "approved"),
      where("categoryId", "==", categoryId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setWorkers(list);
        setLoading(false);
      },

      // ✅ THIS IS THE MAIN FIX
      (error) => {
        console.error("🔥 Firestore Error:", error);
        setWorkers([]);
        setLoading(false);
      }
    );

    return () => unsub();

  }, [categoryId]);

  return { workers, loading };
}
