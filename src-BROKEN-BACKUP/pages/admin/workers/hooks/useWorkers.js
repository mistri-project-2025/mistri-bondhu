import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebase/config";
export default function useWorkers() {
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers"), 
      (snap) => {
        setApproved(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);
  return { approved, loading };
}
