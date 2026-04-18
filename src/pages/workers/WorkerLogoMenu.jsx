import { useState } from "react";

export default function WorkerLogoMenu({
  onEdit,
  onFeedback,
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);

  const openModal = () => {
    setOpen(true);
    onOpenChange && onOpenChange(true); // dashboard header hide
  };

  const closeModal = () => {
    setOpen(false);
    onOpenChange && onOpenChange(false); // dashboard header show
  };

  return (
    <>
      {/* MB Logo */}
      <div
        onClick={openModal}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#1976D2",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 48,
          cursor: "pointer",
          marginBottom: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        MB
      </div>

      {/* Menu modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            padding: 20,
            zIndex: 1000,
          }}
        >
          {/* Close */}
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              fontSize: 28,
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            ×
          </button>

          {/* 🔵 Modal Header (same color as dashboard) */}
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 800,
                marginBottom: 6,
                color: "#4A90E2",
              }}
            >
              🧑‍🔧 মিস্ত্রি বন্ধু
            </h1>
          </div>

          {/* Menu buttons */}
          <button
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
            onClick={() => {
              onEdit();
              closeModal();
            }}
          >
            ✏️ Edit Profile
          </button>

          <button
            style={{ width: "100%", padding: 12 }}
            onClick={() => {
              onFeedback();
              closeModal();
            }}
          >
            📝 Feedback
          </button>
        </div>
      )}
    </>
  );
}
