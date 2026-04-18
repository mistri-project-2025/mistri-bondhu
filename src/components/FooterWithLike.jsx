// src/components/FooterWithLike.jsx
import { useEffect, useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db, getSettingsDoc } from "../firebase/config";

export default function FooterWithLike({ userId }) {
  const currentYear = new Date().getFullYear();

  // STATES
  const [footerText, setFooterText] = useState(`© ${currentYear} Mistri Bondhu`);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showFooterFull, setShowFooterFull] = useState(false);

  /* ---------- Footer Text from Firestore ---------- */
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const snap = await getDoc(getSettingsDoc("footerText"));
        if (snap.exists()) setFooterText(snap.data().text);
      } catch (err) {
        console.error("Footer fetch error:", err);
      }
    };
    fetchFooter();
  }, []);

  /* ---------- Realtime Like Listener ---------- */
  useEffect(() => {
    const likeRef = doc(db, "likes", "footerLike");

    const unsub = onSnapshot(likeRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikes(data.count || 0);
        setLiked(userId ? data.users?.includes(userId) : false);
      } else {
        setLikes(0);
        setLiked(false);
      }
    });

    return () => unsub();
  }, [userId]);

  /* ---------- Like Action ---------- */
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!userId) {
      alert("Please login to like!");
      return;
    }
    if (liked) return;

    const likeRef = doc(db, "likes", "footerLike");

    try {
      await updateDoc(likeRef, {
        count: increment(1),
        users: arrayUnion(userId),
      });
    } catch {
      // first time create doc
      await setDoc(likeRef, { count: 1, users: [userId] });
    }
  };

  /* ---------- Share Action ---------- */
  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: "Mistri Bondhu",
        text: "Trusted worker app",
        url: window.location.origin,
      });
    } else {
      alert("Share not supported on this browser");
    }
  };

  return (
    <>
      <footer
        onClick={() => setShowFooterFull(true)}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 12,
          background: "#f9f9f9",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
          zIndex: 1000,
        }}
      >
        {/* 👍 LIKE */}
        <button
          onClick={handleLike}
          style={{
            fontSize: 18,
            padding: "6px 14px",
            marginBottom: 8,
            background: liked ? "#1976D2" : "#fff",
            color: liked ? "#fff" : "#000",
            border: "1px solid #1976D2",
            borderRadius: 6,
            cursor: liked ? "default" : "pointer",
          }}
        >
          👍 {likes}
        </button>

        {/* 📤 SHARE */}
        <button
          onClick={handleShare}
          style={{
            fontSize: 16,
            padding: "6px 14px",
            marginBottom: 8,
            borderRadius: 6,
            border: "1px solid #1976D2",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Share
        </button>

        {/* Footer text */}
        <p style={{ fontSize: 14, margin: 0 }}>
          © {currentYear} {footerText.replace(/^©\s*\d+\s*/, "")}
        </p>
      </footer>

      {/* FULLSCREEN FOOTER MODAL */}
      {showFooterFull && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            padding: 16,
            zIndex: 2000,
          }}
        >
          <p style={{ fontSize: 18 }}>{footerText}</p>
          <button
            onClick={() => setShowFooterFull(false)}
            style={{
              marginTop: 12,
              padding: "6px 12px",
              fontSize: 16,
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
