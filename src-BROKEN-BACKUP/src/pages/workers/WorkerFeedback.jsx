import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

export default function WorkerFeedback({ uid, onClose }) {
  const WORKER_ROLE = "worker";

  const [inbox, setInbox] = useState([]);
  const [sendbox, setSendbox] = useState([]);
  const [text, setText] = useState("");
  const [openInbox, setOpenInbox] = useState(false);
  const [openSendbox, setOpenSendbox] = useState(false);
  const listRef = useRef(null);

  // 🔹 Load worker messages only when uid is available
  useEffect(() => {
    if (!uid) return;

    const loadMessages = async () => {
      const snap = await getDocs(collection(db, "feedbacks"));
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setInbox(msgs.filter((m) => m.userId === uid && m.role !== WORKER_ROLE));
      setSendbox(msgs.filter((m) => m.userId === uid && m.role === WORKER_ROLE));
    };

    loadMessages();
  }, [uid]);

  const send = async () => {
    if (!text.trim()) return;

    const newMsg = {
      userId: uid,
      role: WORKER_ROLE,
      message: text,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "feedbacks"), newMsg);
      setSendbox((p) => [...p, { ...newMsg, id: docRef.id }]);
      setText("");

      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Message send failed!");
    }
  };

  const del = async (id, type) => {
    await deleteDoc(doc(db, "feedbacks", id));

    if (type === "send") setSendbox((p) => p.filter((m) => m.id !== id));
    else setInbox((p) => p.filter((m) => m.id !== id));
  };

  const renderMessages = (msgs, type) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {msgs.map((m) => (
        <div
          key={m.id}
          style={{
            maxWidth: "85%",
            alignSelf: type === "send" ? "flex-end" : "flex-start",
            background: type === "send" ? "#DCF8C6" : "#F1F1F1",
            padding: 12,
            borderRadius: 12,
            display: "flex",
            gap: 8,
          }}
        >
          <div style={{ flex: 1, wordBreak: "break-word" }}>{m.message}</div>
          <button
            onClick={() => del(m.id, type)}
            style={{ border: "none", background: "none", color: "red", cursor: "pointer" }}
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  );

  // 🔹 Only render if uid exists (prevents auto open on refresh)
  if (!uid) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "70vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        zIndex: 3000,
        boxShadow: "0 4px 20px rgba(0,0,0,.2)",
      }}
    >
      {/* HEADER */}
      <div style={{ padding: 14, display: "flex", justifyContent: "space-between" }}>
        <h3>🧑‍🔧 Worker Feedback</h3>
        <button onClick={onClose} style={{ fontSize: 26, background: "none", border: "none" }}>
          ×
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ padding: "0 14px 10px", display: "flex", gap: 10 }}>
        <button onClick={() => setOpenSendbox(true)}>📤 Sent ({sendbox.length})</button>
        <button onClick={() => setOpenInbox(true)}>📥 Inbox ({inbox.length})</button>
      </div>

      {/* MESSAGE LIST */}
      <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "0 14px" }}>
        {renderMessages(sendbox, "send")}
      </div>

      {/* INPUT */}
      <div style={{ padding: 14, borderTop: "1px solid #ddd" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Admin ke message likhun…"
          style={{ width: "100%", minHeight: 70, resize: "none", padding: 10, fontSize: 16 }}
        />
        <button
          onClick={send}
          style={{ width: "100%", marginTop: 8, padding: 10, fontSize: 16 }}
        >
          Send
        </button>
      </div>

      {/* FULL SCREEN BOXES */}
      {openSendbox && <FullScreen title="📤 Sent Messages" onClose={() => setOpenSendbox(false)}>{renderMessages(sendbox, "send")}</FullScreen>}
      {openInbox && <FullScreen title="📥 Inbox" onClose={() => setOpenInbox(false)}>{renderMessages(inbox, "inbox")}</FullScreen>}
    </div>
  );
}

// 🔹 Full screen helper
function FullScreen({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 4000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 14, display: "flex", justifyContent: "space-between" }}>
        <h3>{title}</h3>
        <button onClick={onClose} style={{ fontSize: 26, background: "none", border: "none" }}>
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>{children}</div>
    </div>
  );
}
