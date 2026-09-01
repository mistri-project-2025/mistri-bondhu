import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

import FooterWithLike from "../../components/FooterWithLike";
import LogoutButton from "../../components/LogoutButton";

import WorkerProfile from "./WorkerProfile";
import WorkerLeads from "./WorkerLeads";
import WorkerFeedback from "./WorkerFeedback";

export default function WorkerDashboard() {
  const { user, login } = useAuth();
  const uid = user?.uid;

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [showLeadsFull, setShowLeadsFull] = useState(false);
  const [leadCount, setLeadCount] = useState(0);
  const [hasNewLead, setHasNewLead] = useState(false);
  const prevCountRef = useRef(0);

  // ✅ AUTO STATUS SYNC
  useEffect(() => {
    if (!uid) return;
    const syncStatus = async () => {
      try {
        let ref = doc(db, "workers", uid);
        let snap = await getDoc(ref);
        if (snap.exists()) {
          login({...user,...snap.data(), status: "approved" });
          return;
        }
        ref = doc(db, "pendingWorkers", uid);
        snap = await getDoc(ref);
        if (snap.exists()) {
          login({...user,...snap.data(), status: "pending" });
        }
      } catch (err) {
        console.error("Status sync error:", err);
      }
    };
    syncStatus();
  }, [uid]);

  // 🔔 BELL NOTIFICATION LOGIC
  useEffect(() => {
    if (!uid) return;
    const checkLeads = async () => {
      try {
        const snap = await getDocs(collection(db, "leads"));
        const filtered = snap.docs.map(d => d.data()).filter(l =>
          (l.sentTo && l.sentTo.includes(uid)) || (l.sentToUids && l.sentToUids.includes(uid)) || l.workerId === uid
        );
        if (filtered.length > prevCountRef.current && prevCountRef.current!== 0) {
          setHasNewLead(true);
          // Sound + Vibrate
          const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3");
          audio.play().catch(()=>{});
          if (navigator.vibrate) navigator.vibrate([300,100,300]);
          // Auto off after 5 sec
          setTimeout(() => setHasNewLead(false), 5000);
        }
        prevCountRef.current = filtered.length;
        setLeadCount(filtered.length);
      } catch (e) { console.log(e); }
    };
    checkLeads();
    if (Notification && Notification.permission!== "granted") Notification.requestPermission();
    const interval = setInterval(checkLeads, 10000);
    return () => clearInterval(interval);
  }, [uid]);

  if (!uid) return <p>Worker login required</p>;

  return (
    <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "#F8F8F8" }}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={{ color: "#1e88e5" }}>Mistri </span>
          <span style={{ color: "orange" }}>Bondhu</span>
        </h1>
      </div>

      <div style={styles.topSection}>
        <div style={styles.logo} onClick={() => setModalOpen(true)}>
          <span style={{ color: "#1e88e5" }}>M</span>
          <span style={{ color: "orange" }}>B</span>
        </div>
        {user && (
          <div style={styles.userBox}>
            <span>{user?.name || "Loading..."}</span>
            <span>•</span>
            <span>{user?.status === "approved"? "✅ Active" : "⏳ Pending"}</span>
            {user?.category && (<><span>•</span><span>{user.category}</span></>)}
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>
              <span style={{ color: "#1e88e5" }}>Mistri </span>
              <span style={{ color: "orange" }}>Bondhu</span>
            </h2>
          </div>
          <div style={styles.logout}><LogoutButton /></div>
          <div style={styles.btnRow}>
            <button onClick={() => setActiveTab("profile")} style={{...styles.btn, backgroundColor: activeTab === "profile"? "#1976D2" : "#E6F0FF", color: activeTab === "profile"? "#fff" : "#1976D2" }}>✏️ Edit Profile</button>
            <button onClick={() => setActiveTab("feedback")} style={{...styles.btn, backgroundColor: activeTab === "feedback"? "#1976D2" : "#E6F0FF", color: activeTab === "feedback"? "#fff" : "#1976D2" }}>📝 Feedback</button>
          </div>
          <button onClick={() => { setModalOpen(false); setActiveTab(null); }} style={styles.closeBtn}>×</button>
          <div style={styles.modalContent}>
            {activeTab === "profile" && (<WorkerProfile uid={uid} onClose={() => setActiveTab(null)} />)}
            {activeTab === "feedback" && (<WorkerFeedback uid={uid} onClose={() => setActiveTab(null)} />)}
          </div>
        </div>
      )}

      {/* Leads with Bell */}
      <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "15px", borderRadius: 12, border: hasNewLead? "2px solid red" : "1px solid #ddd" }}>
        <button style={styles.linkBtn} onClick={() => { setShowLeadsFull(true); setHasNewLead(false); }}>
          📞 Recent Leads ({leadCount})
        </button>
        <div
          style={{
            position: "relative",
            fontSize: 32,
            cursor: "pointer",
            animation: hasNewLead? "shake 0.5s infinite" : "none"
          }}
          onClick={() => { setShowLeadsFull(true); setHasNewLead(false); }}
        >
          🔔
          {leadCount > 0 && (
            <span style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", fontSize: 12, padding: "2px 7px", borderRadius: 12, fontWeight: "bold" }}>{leadCount}</span>
          )}
          {hasNewLead && (
            <span style={{ position: "absolute", top: -10, right: 15, width: 12, height: 12, background: "red", borderRadius: "50%", animation: "pulse 1s infinite" }}></span>
          )}
        </div>
      </div>
      {hasNewLead && <p style={{ color: "red", fontWeight: "bold", textAlign: "center", marginTop: 10, animation: "blink 1s infinite" }}>🔔 নতুন Lead এসেছে! Click করুন</p>}

      {showLeadsFull && (
        <div style={styles.fullPage}>
          <button style={styles.closeBtn} onClick={() => setShowLeadsFull(false)}>×</button>
          <WorkerLeads uid={uid} />
        </div>
      )}

      <FooterWithLike userId={uid} />
      <style>{`@keyframes shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }`}</style>
    </div>
  );
}

const styles = {
  header: { textAlign: "center", marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 800 },
  topSection: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logo: { padding: "12px 16px", backgroundColor: "#fff", borderRadius: 10, fontSize: 32, fontWeight: 800, cursor: "pointer" },
  userBox: { display: "flex", gap: 8, padding: "4px 12px", backgroundColor: "#E6F0FF", borderRadius: 8, color: "#1976D2", fontWeight: 600 },
  modal: { position: "fixed", inset: 0, background: "#fff", zIndex: 3000, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30 },
  logout: { alignSelf: "flex-end", paddingRight: 16, marginBottom: 20 },
  btnRow: { display: "flex", gap: 20, marginBottom: 30 },
  btn: { padding: "12px 24px", fontSize: 18, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer" },
  closeBtn: { position: "absolute", top: 12, right: 12, fontSize: 28, border: "none", background: "none", cursor: "pointer", color: "#FF4D4F" },
  modalContent: { width: "90%", flex: 1, overflowY: "auto" },
  linkBtn: { background: "transparent", border: "none", fontSize: 18, color: "#1976D2", cursor: "pointer", fontWeight: "bold" },
  fullPage: { position: "fixed", inset: 0, background: "#fff", padding: 16, zIndex: 2000, overflowY: "auto" },
};
