import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProviderHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "provider") {
      navigate("/role");
    }
  }, [user, navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user?.name}</h2>
      <p>Role: Provider</p>

      <hr />

      <h3>Search Workers</h3>

      <button onClick={() => navigate("/provider/search")}>
        Go to Search
      </button>

      <hr />

      <h3>Your Activity</h3>
      <p>(Search history / Leads – Admin dashboard)</p>
    </div>
  );
}
