import { useEffect, useState } from "react";
import { getSettingsDoc } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Footer({ adminMode = false, adminUpdateCallback }) {
  const currentYear = new Date().getFullYear();
  const [footerText, setFooterText] = useState(`© ${currentYear} Mistri Bondhu`);
  const [showFooterFull, setShowFooterFull] = useState(false);

  // Fetch footer from Firebase on mount
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const snap = await getDoc(getSettingsDoc("footerText"));
        if (snap.exists()) setFooterText(snap.data().text);
      } catch (err) {
        console.error("Error fetching footer:", err);
      }
    };
    fetchFooter();
  }, []);

  // Handle admin text change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setFooterText(newText);

    // Notify parent / dashboard for admin updates
    if (adminMode && adminUpdateCallback) {
      adminUpdateCallback(newText);
    }
  };

  return (
    <>
      {/* Footer bar */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          cursor: "pointer",
          background: "#f9f9f9",
          padding: "8px 0",
        }}
        onClick={() => setShowFooterFull(true)}
      >
        {footerText}
      </footer>

      {/* Modal / Fullscreen view */}
      {showFooterFull && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            padding: 16,
            overflowY: "auto",
            zIndex: 999,
          }}
        >
          {adminMode ? (
            <>
              <h3>✏️ Edit Footer Text (Admin)</h3>
              <input
                value={footerText}
                onChange={handleTextChange}
                style={{
                  fontSize: 18,
                  padding: "8px 10px",
                  width: "100%",
                  marginBottom: 12,
                }}
              />
              <p>Admin can edit this text. Changes will reflect immediately.</p>
            </>
          ) : (
            <p style={{ fontSize: 18 }}>{footerText}</p>
          )}
          <button
            onClick={() => setShowFooterFull(false)}
            style={{ marginTop: 12, padding: "6px 12px", fontSize: 16 }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
