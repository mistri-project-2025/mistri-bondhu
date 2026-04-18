// src/components/Navbar.jsx
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { user, login } = useAuth();

  return (
    <nav
      style={{
        padding: "15px 20px",
        background: "#0b5cff",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: "18px" }}>
        Mistri Bondhu
      </span>

      <div>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>
              Hi, {user.name}
            </span>
            <LogoutButton />
          </>
        ) : (
          <button
            onClick={login}
            style={{
              padding: "8px 14px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
