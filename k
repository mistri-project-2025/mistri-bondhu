import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCategoryLabel } from "../utils/categories";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [showFooterContent, setShowFooterContent] = useState(false);

  const lang = "bn";
  const title = lang === "bn" ? "মিস্ত্রি বন্ধু" : "Mistri Bondhu";
  const subtitle =
    lang === "bn"
      ? "বিশ্বাসযোগ্য মিস্ত্রি আপনার পাশে"
      : "Trusted workers near you";

  const placeholder =
    lang === "bn"
      ? "মিস্ত্রি / প্রোভাইডার খুঁজুন..."
      : "Search worker / provider...";

  const currentYear = new Date().getFullYear();

  const onSearchClick = () => {
    if (!user) setShowRoleSelect(true);
  };

  const onSelectRole = (role) => {
    setShowRoleSelect(false);
    if (role === "worker") navigate("/signup/worker");
    if (role === "provider") navigate("/provider/search");
  };

  /* =========================
     🌐 PUBLIC HOME
     ========================= */
  if (!user) {
    return (
      <>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 60,
            paddingBottom: 120,
            background: "#fafafa",
          }}
        >
          {/* TITLE */}
          <h1 style={{ fontSize: 44, fontWeight: "800", marginBottom: 6 }}>
            {title}
          </h1>
          <p style={{ color: "#4A90E2", fontSize: 18, marginBottom: 40, fontWeight: "500" }}>
            {subtitle}
          </p>

          {/* SEARCH BAR */}
          <div
            onClick={onSearchClick}
            style={{
              width: "90%",
              maxWidth: 420,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 30,
              padding: "14px 20px",
              cursor: "pointer",
              fontSize: 16,
              color: "#555",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              marginBottom: 36,
            }}
          >
            🔍 {placeholder}
          </div>

          {/* ROLE SELECT */}
          {showRoleSelect && (
            <div
              style={{
                marginTop: 12,
                width: "90%",
                maxWidth: 420,
                background: "#fff",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ marginBottom: 14, fontWeight: "600" }}>
                আপনি কী খুঁজছেন?
              </p>

              <button style={btnStyle} onClick={() => onSelectRole("worker")}>
                👷 Worker
              </button>

              <button
                style={btnStyle}
                onClick={() => onSelectRole("provider")}
              >
                🧑‍💼 Provider
              </button>
            </div>
          )}

          {/* ABOUT CONTENT */}
          <div
            style={{
              marginTop: 40,
              maxWidth: 640,
              background: "#f0f8ff",
              borderRadius: 18,
              padding: 22,
              lineHeight: 1.8,
              color: "#333",
              boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ marginBottom: 12 }}>
              <b>মিস্ত্রি বন্ধু</b> এমন একটি ডিজিটাল প্ল্যাটফর্ম যেখানে আপনি খুব সহজেই নিজের এলাকার দক্ষ ও যাচাই করা মিস্ত্রি এবং সার্ভিস প্রোভাইডার খুঁজে পাবেন।
            </p>
            <p style={{ marginBottom: 12 }}>
              কোনো দালাল নেই, কোনো বাড়তি ঝামেলা নেই। সরাসরি যোগাযোগ করে কাজের প্রয়োজন অনুযায়ী সিদ্ধান্ত নিন।
            </p>
            <p>
              আপনি যদি মিস্ত্রি হন, এখানে পাবেন নতুন কাজের সুযোগ। আর যদি কাজের লোক খুঁজে থাকেন, মিস্ত্রি বন্ধু সবসময় আপনার পাশে।
            </p>
          </div>

          {import.meta.env.DEV && (
            <button
              style={devBtnStyle}
              onClick={() => {
                localStorage.setItem(
                  "mb_user",
                  JSON.stringify({
                    role: "admin",
                    name: "System Admin",
                    phone: "9999999999",
                  })
                );
                window.location.reload();
              }}
            >
              🔐 Admin Login (DEV)
            </button>
          )}
        </div>

        {/* FOOTER */}
        <div
          onClick={() => setShowFooterContent(true)}
          style={{
            position: "fixed",
            bottom: 24,
            width: "100%",
            textAlign: "center",
            fontSize: 14,
            color: "#666",
            cursor: "pointer",
          }}
        >
          © {currentYear} মিস্ত্রি বন্ধু
        </div>

        {/* FOOTER FULL SCREEN */}
        {showFooterContent && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#fff",
              zIndex: 999,
              padding: 20,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowFooterContent(false)}
              style={{
                marginBottom: 20,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              ✖ Close
            </button>

            <h2>Admin Notice</h2>
            <p>
              এখানে অ্যাডমিন অ্যাপ সম্পর্কিত নিয়ম, শর্ত, আপডেট বা গুরুত্বপূর্ণ ঘোষণা প্রকাশ করতে পারবেন।
            </p>
          </div>
        )}
      </>
    );
  }

  /* =========================
     👷 LOGGED IN VIEW
     ========================= */
  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user.name}</h2>
      <p><b>Role:</b> {user.role}</p>

      {user.role === "worker" && (
        <>
          <p>
            <b>Status:</b>{" "}
            {user.status === "approved" ? "💚 Approved" : "⏳ Pending"}
          </p>
          <p><b>Category:</b> {getCategoryLabel(user.categoryId)}</p>
          <button style={btnStyle} onClick={() => navigate("/worker/dashboard")}>
            Go to Dashboard
          </button>
        </>
      )}

      {user.role === "provider" && (
        <button style={btnStyle} onClick={() => navigate("/provider/search")}>
          🔍 Search Workers
        </button>
      )}

      {user.role === "admin" && (
        <button style={btnStyle} onClick={() => navigate("/admin")}>
          🛠 Admin Dashboard
        </button>
      )}

      <button onClick={logout} style={btnStyle}>Logout</button>
    </div>
  );
}

const btnStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#f9f9f9",
  cursor: "pointer",
  fontSize: 16,
};

const devBtnStyle = { ...btnStyle, background: "black", color: "white" };
