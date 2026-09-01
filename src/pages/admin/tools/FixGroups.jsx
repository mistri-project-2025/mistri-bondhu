import { useState } from "react";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { getNextGroupData } from "../../../firebase/groupBuilderService";

export default function FixGroups() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const fixAllGroups = async () => {
    setLoading(true);
    setResult("Starting...");

    try {
      // সব approved worker নাও
      const q = query(
        collection(db, "workers"),
        where("status", "==", "approved")
      );

      const snap = await getDocs(q);
      const workers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setResult(`Found ${workers.length} approved workers. Fixing...`);

      // Category + Great wise group করো
      const categoryGroups = {};

      for (const worker of workers) {
        const key = `${worker.categoryId}_${worker.great}`;
        
        if (!categoryGroups[key]) {
          categoryGroups[key] = [];
        }
        categoryGroups[key].push(worker);
      }

      // প্রতিটা category+great এর জন্য নতুন করে group assign করো
      let fixedCount = 0;

      for (const key in categoryGroups) {
        const [categoryId, great] = key.split("_");
        const workersInGroup = categoryGroups[key];

        // Date wise sort করো - আগে যারা approve হয়েছে তারা আগে
        workersInGroup.sort((a, b) => 
          new Date(a.approvalDate) - new Date(b.approvalDate)
        );

        // নতুন করে group assign করো
        for (let i = 0; i < workersInGroup.length; i++) {
          const worker = workersInGroup[i];
          
          // Temporary: সব worker delete করে আবার add করলে group ঠিক হবে
          // কিন্তু সহজ উপায়: groupNo recalculate করো
          
          const groupData = await getNextGroupDataForFix(
            categoryId, 
            great, 
            i // index পাঠাও
          );

          await updateDoc(doc(db, "workers", worker.id), {
            groupNo: groupData.groupNo,
            groupLabel: groupData.groupLabel,
          });

          fixedCount++;
          setResult(`Fixed ${fixedCount}/${workers.length} workers...`);
        }
      }

      setResult(`✅ Done! Fixed ${fixedCount} workers. Refresh your admin page.`);
    } catch (err) {
      console.error(err);
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper: index অনুযায়ী group বানাও
  const getNextGroupDataForFix = async (categoryId, great, index) => {
    const GROUP_SIZE = {
      "A+": 5, "A": 5,
      "B+": 7, "B": 7,
      "C+": 10, "C": 10,
    };

    const size = GROUP_SIZE[great] || 5;
    const groupNo = Math.floor(index / size) + 1;

    return {
      groupNo,
      groupLabel: `${groupNo}${great}`,
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔧 Fix Worker Groups</h2>
      <p>এই টুল সব worker এর গ্রুপ ঠিক করে দেবে।</p>
      <p style={{ color: "red" }}>
        ⚠️ Warning: এটা সব worker এর groupNo change করে দেবে। Backup নিয়ে রাখো।
      </p>
      
      <button 
        onClick={fixAllGroups} 
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "#ccc" : "#ff5722",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 16
        }}
      >
        {loading ? "Fixing..." : "Fix All Groups"}
      </button>

      <pre style={{ marginTop: 20, background: "#f5f5f5", padding: 10 }}>
        {result}
      </pre>
    </div>
  );
}
