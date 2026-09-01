import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebase/config";
export default function useWorkerGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workerGroups"), 
      (snap) => setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {}
    );
    return () => unsub();
  }, []);
  const rebuildAllGroups = async () => alert("Rebuild clicked - workers: " + groups.length);
  const fixDuplicateGroups = async () => alert("Fix duplicate clicked");
  const getLimit = () => 5;
  return { groups, loading, rebuildAllGroups, fixDuplicateGroups, getLimit };
}
