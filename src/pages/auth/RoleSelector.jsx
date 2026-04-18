import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * RoleSelector (UI disabled)
 * -------------------------
 * ❌ No UI
 * ✅ Keeps route + logic safe
 * ✅ Prevents "Select Role / Worker / Provider" screen
 */
export default function RoleSelector() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔁 If somehow user lands here, send back to Home
    navigate("/", { replace: true });
  }, [navigate]);

  return null; // 👈 absolutely no UI
}
