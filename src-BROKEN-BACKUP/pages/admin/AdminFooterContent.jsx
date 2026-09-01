import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminFooterContent() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const ref = doc(db, "settings", "footerContent");

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setText(snap.data().content || "");
      }
    };
    load();
  }, []);

  const saveContent = async () => {
    setLoading(true);
    try {
      await setDoc(ref, {
        title: "Mistri Bondhu",
        content: text,
        updatedAt: new Date()
      });
      alert("Saved successfully");
    } catch (err) {
      alert("Save failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Footer Content Editor</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: "100%", marginTop: 10 }}
        placeholder="Write footer content here..."
      />

      <button onClick={saveContent} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
