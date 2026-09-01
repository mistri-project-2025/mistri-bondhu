import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";                                    import { getCategoryLabel } from "../../utils/categories";
import { signOut } from "firebase/auth";    import { auth } from "../../firebase/config";                                                                                       export default function AdminDashboard() {    const { user, logout } = useAuth();         const navigate = useNavigate();             const location = useLocation();             const [showModal, setShowModal] = useState(false);                                                                                  useEffect(() => {                             if (!user || user.role !== "admin") {         navigate("/role");                        }                                         }, [user, navigate]);

  useEffect(() => {
    if (location.pathname !== "/admin" && location.pathname !== "/admin/") {
      setShowModal(true);
    }
  }, [location.pathname]);

  if (!user || user.role !== "admin") return null;

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate("/");
  };

  const openInModal = (path) => {
    navigate(path);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    navigate("/admin");
  };

  const btn = (bg) => ({
    padding: "14px", border: "none", borderRadius: 12, fontWeight: "bold",                  background: bg, color: "#fff", cursor: "pointer", fontSize: 15
  });
                                              return (
    <div style={{ padding: 15, background: "#f0f4ff", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>Admin Dashboard</h2>
                                                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto" }}>
        <button onClick={() => openInModal("/admin/workers")} style={btn("#2196F3")}>Workers</button>
        <button onClick={() => openInModal("/admin/workers/groups")} style={btn("#9C27B0")}>Worker Groups Pro</button>                      <button onClick={() => openInModal("/admin/providers")} style={btn("#009688")}>Providers</button>
        <button onClick={() => openInModal("/admin/feedback")} style={btn("#FF9800")}>Feedback</button>
        <button onClick={() => openInModal("/admin/search")} style={btn("#3F51B5")}>Search</button>
        <button onClick={() => openInModal("/admin/leads")} style={btn("#607D8B")}>Lead History</button>
        <button onClick={() => openInModal("/admin/activities")} style={btn("#4CAF50")}>Lead Activities</button>
        <button onClick={() => openInModal("/admin/fix-groups")} style={btn("#FF5722")}>Fix Worker Groups</button>                          <button onClick={() => openInModal("/admin/footer")} style={btn("#795548")}>Footer Content</button>
        <button onClick={handleLogout} style={btn("#212121")}>Logout</button>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#fff", zIndex: 99999, display: "flex", flexDirection: "column" }}>                <div style={{ padding: 12, background: "#2196F3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ color: "#fff" }}>{location.pathname}</b>                                    <button onClick={closeModal} style={{ background: "#fff", color: "red", border: "none", padding: "8px 16px", borderRadius: 20, fontWeight: "bold" }}>X Close</button>                                                     </div>                                      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>                                 <Outlet />                                </div>                                    </div>
      )}                                        </div>                                    );                                        }
