import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
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

  // ✅ AUTO STATUS SYNC
  useEffect(() => {
    if (!uid) return;

    const syncStatus = async () => {
      try {
        let ref = doc(db, "workers", uid);
        let snap = await getDoc(ref);

        if (snap.exists()) {
          login({ ...user, ...snap.data(), status: "approved" });
          return;
        }

        ref = doc(db, "pendingWorkers", uid);
        snap = await getDoc(ref);

        if (snap.exists()) {
          login({ ...user, ...snap.data(), status: "pending" });
        }
      } catch (err) {
        console.error("Status sync error:", err);
      }
    };

    syncStatus();
  }, [uid, user]);

  if (!uid) return <p>Worker login required</p>;

  return (
    <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "#F8F8F8" }}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={{ color: "#1e88e5" }}>Mistri </span>
          <span style={{ color: "orange" }}>Bondhu</span>
        </h1>
      </div>

      {/* Top Section */}
      <div style={styles.topSection}>

        {/* Logo */}
        <div style={styles.logo} onClick={() => setModalOpen(true)}>
          <span style={{ color: "#1e88e5" }}>M</span>
          <span style={{ color: "orange" }}>B</span>
        </div>

        {/* Worker Info */}
        {user && (
          <div style={styles.userBox}>
            <span>{user?.name || "Loading..."}</span>
            <span>•</span>

            <span>
              {user?.status === "approved" ? "✅ Active" : "⏳ Pending"}
            </span>

            {user?.category && (
              <>
                <span>•</span>
                <span>{user.category}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 🔵 MODAL */}
      {modalOpen && (
        <div style={styles.modal}>

          {/* Modal Header */}
          <div style={styles.header}>
            <h2 style={styles.title}>
              <span style={{ color: "#1e88e5" }}>Mistri </span>
              <span style={{ color: "orange" }}>Bondhu</span>
            </h2>
          </div>

          {/* Logout */}
          <div style={styles.logout}>
            <LogoutButton />
          </div>

          {/* Buttons */}
          <div style={styles.btnRow}>
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                ...styles.btn,
                backgroundColor: activeTab === "profile" ? "#1976D2" : "#E6F0FF",
                color: activeTab === "profile" ? "#fff" : "#1976D2",
              }}
            >
              ✏️ Edit Profile
            </button>

            <button
              onClick={() => setActiveTab("feedback")}
              style={{
                ...styles.btn,
                backgroundColor: activeTab === "feedback" ? "#1976D2" : "#E6F0FF",
                color: activeTab === "feedback" ? "#fff" : "#1976D2",
              }}
            >
              📝 Feedback
            </button>
          </div>

          {/* Close */}
          <button
            onClick={() => {
              setModalOpen(false);
              setActiveTab(null);
            }}
            style={styles.closeBtn}
          >
            ×
          </button>

          {/* Content */}
          <div style={styles.modalContent}>
            {activeTab === "profile" && (
              <WorkerProfile uid={uid} onClose={() => setActiveTab(null)} />
            )}
            {activeTab === "feedback" && (
              <WorkerFeedback uid={uid} onClose={() => setActiveTab(null)} />
            )}
          </div>
        </div>
      )}

      {/* Leads */}
      <div style={{ marginTop: 30 }}>
        <button style={styles.linkBtn} onClick={() => setShowLeadsFull(true)}>
          📞 Recent Leads
        </button>
      </div>

      {showLeadsFull && (
        <div style={styles.fullPage}>
          <button style={styles.closeBtn} onClick={() => setShowLeadsFull(false)}>×</button>
          <WorkerLeads uid={uid} />
        </div>
      )}

      {/* Footer */}
      <FooterWithLike userId={uid} />
    </div>
  );
}

const styles = {
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    padding: "12px 16px",
    backgroundColor: "#fff",
    borderRadius: 10,
    fontSize: 32,
    fontWeight: 800,
    cursor: "pointer",
  },
  userBox: {
    display: "flex",
    gap: 8,
    padding: "4px 12px",
    backgroundColor: "#E6F0FF",
    borderRadius: 8,
    color: "#1976D2",
    fontWeight: 600,
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "#fff",
    zIndex: 3000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 30,
  },
  logout: {
    alignSelf: "flex-end",
    paddingRight: 16,
    marginBottom: 20,
  },
  btnRow: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
  },
  btn: {
    padding: "12px 24px",
    fontSize: 18,
    fontWeight: 600,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 28,
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#FF4D4F",
  },
  modalContent: {
    width: "90%",
    flex: 1,
    overflowY: "auto",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    color: "#1976D2",
    cursor: "pointer",
  },
  fullPage: {
    position: "fixed",
    inset: 0,
    background: "#fff",
    padding: 16,
    zIndex: 2000,
  },
};
