import { useEffect, useState, useRef } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminFeedback() {
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState("");
  const chatRef = useRef(null);

  // 🔹 Real-time messages
  useEffect(() => {
    const q = query(collection(db, "feedbacks"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(data);
    });
    return () => unsub();
  }, []);

  // 🔹 Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, activeUser]);

  // 🔹 Unique users list
  const users = [...new Map(messages.map((m) => [m.userId, m])).values()].reverse();

  // 🔹 Active chat
  const chat = messages.filter((m) => m.userId === activeUser);

  // 🔹 Send reply
  const sendReply = async () => {
    if (!text.trim() || !activeUser) return;

    await addDoc(collection(db, "feedbacks"), {
      userId: activeUser,
      role: "admin",
      message: text,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      {/* LEFT – USER LIST */}
      <div style={{ width: 280, borderRight: "1px solid #ddd", overflowY: "auto" }}>
        <h3 style={{ padding: 12 }}>💬 Feedback</h3>
        {users.length === 0 && <p style={{ padding: 12 }}>No feedback yet</p>}
        {users.map((u) => (
          <div
            key={u.userId}
            onClick={() => setActiveUser(u.userId)}
            style={{
              padding: 12,
              cursor: "pointer",
              background: activeUser === u.userId ? "#E3F2FD" : "#fff",
              borderBottom: "1px solid #eee",
            }}
          >
            <b>👤 {u.userId}</b>
            <div
              style={{
                fontSize: 13,
                color: "#555",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {u.message}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT – CHAT WINDOW */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeUser ? (
          <>
            <div style={{ padding: 12, borderBottom: "1px solid #ddd", fontWeight: "bold" }}>
              👤 {activeUser}
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 14, background: "#f0f2f5" }}>
              {chat.map((m) => (
                <div
                  key={m.id}
                  style={{
                    textAlign: m.role === "admin" ? "right" : "left",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 18,
                      maxWidth: "70%",
                      background: m.role === "admin" ? "#DCF8C6" : "#fff",
                    }}
                  >
                    {m.message}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #ddd" }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
                style={{ flex: 1, resize: "none", padding: 10, borderRadius: 8 }}
              />
              <button
                onClick={sendReply}
                style={{
                  padding: "0 20px",
                  borderRadius: 8,
                  background: "#0b93f6",
                  color: "#fff",
                  border: "none",
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
            }}
          >
            👈 Select a user to start chat
          </div>
        )}
      </div>
    </div>
  );
}
