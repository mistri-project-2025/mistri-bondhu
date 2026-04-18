import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Role</h2>

      <button onClick={() => navigate("/signup/worker")}>
        Worker
      </button>

      <br /><br />

      <button onClick={() => navigate("/signup/provider")}>
        Provider
      </button>
    </div>
  );
}
