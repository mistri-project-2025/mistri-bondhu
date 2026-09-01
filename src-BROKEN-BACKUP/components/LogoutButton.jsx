// src/components/LogoutButton.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function LogoutButton({ label = "Logout" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1️⃣ Firebase logout
      await signOut(auth);

      // 2️⃣ Clear context / localStorage
      logout();

      // 3️⃣ Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 14px",
        backgroundColor: "#f44336",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
