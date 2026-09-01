import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function FooterPage() {
  const [content, setContent] = useState("Loading...");

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "settings", "footerContent"));
      if (snap.exists()) {
        setContent(snap.data().content);
      } else {
        setContent("No content found");
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 About Mistri Bondhu</h2>
      <p>{content}</p>
    </div>
  );
}
