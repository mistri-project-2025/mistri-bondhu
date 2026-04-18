import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ context logout

  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOut(auth); // Firebase logout
        logout();            // ✅ localStorage clear + user null
        console.log("✅ Full logout success");
        navigate("/");
      } catch (err) {
        console.error("❌ Logout failed", err);
      }
    };

    doLogout();
  }, [navigate, logout]);

  return <p style={{ padding: 20 }}>Logging out…</p>;
}
