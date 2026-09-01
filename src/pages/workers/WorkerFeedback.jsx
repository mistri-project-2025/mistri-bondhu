import { useEffect, useState, useRef } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function WorkerFeedback({ uid, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatRef = useRef(null);

  // 🔹 Real-time - শুধু এই worker এর message
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "feedbacks"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id,...d.data() }));
      setMessages(data.filter((m) => m.userId === uid));
    });
    return () => unsub();
  }, [uid]);

  // 🔹 Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "feedbacks"), {
      userId: uid,
      role: "worker",
      message: text,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  if (!uid) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 3000, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #ddd", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>🧑‍🔧 Admin Chat</span>
        <button onClick={onClose} style={{ fontSize: 26, background: "none", border: "none", cursor: "pointer" }}>×</button>
      </div>

      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 14, background: "#f0f2f5" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ textAlign: m.role === "worker"? "right" : "left", marginBottom: 8 }}>
            <span style={{ display: "inline-block", padding: "10px 14px", borderRadius: 18, maxWidth: "70%", wordBreak: "break-word", background: m.role === "worker"? "#DCF8C6" : "#fff", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" }}>
              {m.message}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #ddd" }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Message likhun…" style={{ flex: 1, resize: "none", padding: 10, borderRadius: 8, fontSize: 16 }} onKeyDown={(e)=>{ if(e.key==="Enter" &&!e.shiftKey){ e.preventDefault(); send(); } }} />
        <button onClick={send} style={{ padding: "0 20px", borderRadius: 8, background: "#0b93f6", color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}
