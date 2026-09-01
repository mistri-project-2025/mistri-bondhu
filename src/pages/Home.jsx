// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../utils/categories";
import FooterWithLike from "../components/FooterWithLike";
import { doc, setDoc } from "firebase/firestore";
import { providersCollection, auth } from "../firebase/config";
import { signInAnonymously, signOut } from "firebase/auth";

export default function Home() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [providerStep, setProviderStep] = useState("idle");
  const [providerCategory, setProviderCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [providerPhone, setProviderPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const subtitle = "Trusted Mistri Beside You";

  const onSearchClick = () => {
    setProviderStep("category");
  };

  const handleCategorySelect = (cat) => {
    setProviderCategory(cat);
    setCategorySearch(cat.en);
    setShowCategoryList(false);
    setProviderStep("phone");
  };

  const getLocationBackground = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ address: "Address not found", pincode: "700001", lat: null, lon: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=en`);
            const data = await res.json();
            resolve({ address: data.display_name || "Address not found", pincode: data.address?.postcode || "700001", lat, lon, area: data.address?.suburb || "", district: data.address?.city || "" });
          } catch (e) {
            resolve({ address: "Address not found", pincode: "700001", lat: pos.coords.latitude, lon: pos.coords.longitude });
          }
        },
        () => resolve({ address: "Location Permission Denied", pincode: "700001", lat: null, lon: null }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const handleProviderSignup = async () => {
    if (!providerCategory) return alert("Category required");
    if (!providerPhone || providerPhone.length!== 10) return;
    setIsSaving(true);
    try {
      if (auth.currentUser) await signOut(auth);
      const res = await signInAnonymously(auth);
      const userAuth = res.user;
      const loc = await getLocationBackground();
      const payload = {
        uid: userAuth.uid, role: "provider", phone: providerPhone,
        categoryId: providerCategory.id, category: providerCategory.en,
        name: `Provider`, address: loc.address, providerAddress: loc.address,
        pincode: loc.pincode, providerPincode: loc.pincode,
        area: loc.area || "", district: loc.district || "",
        latitude: loc.lat, longitude: loc.lon, experience: "",
        status: "active", createdAt: new Date().toISOString(),
      };
      await setDoc(doc(providersCollection, userAuth.uid), payload);
      login(payload);
      setProviderStep("idle");
    } catch (err) { alert(err?.message || JSON.stringify(err)); }
    finally { setIsSaving(false); }
  };

  useEffect(() => {
    if (providerStep === "phone" && providerPhone.length === 10 &&!isSaving) handleProviderSignup();
  }, [providerPhone]);

  useEffect(() => {
    if (user?.role === "provider" && providerStep === "idle") navigate("/provider/dashboard");
  }, [user, providerStep, navigate]);

  if (!user || (user.role === "provider" && providerStep!== "idle")) {
    return (
      <>
        <div style={{ minHeight: "100vh", backgroundColor: "#F8F8F8", padding: 16, paddingBottom: 140 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              <span style={{ color: "#1e88e5" }}>Mistri </span>
              <span style={{ color: "orange" }}>Bondhu</span>
            </h1>
          </div>

          <div style={styles.topSection}>
            <div style={styles.logo} onClick={() => setModalOpen(true)}>
              <span style={{ color: "#1e88e5" }}>M</span>
              <span style={{ color: "orange" }}>B</span>
            </div>
            <div style={styles.userBox}>
              <span>Welcome</span><span>•</span><span>🏠 Home</span>
            </div>
          </div>

          <p style={{ color: "#4A90E2", fontSize: 16, textAlign: "center", marginBottom: 24 }}>{subtitle}</p>

          <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
            <label style={{fontWeight:"600", marginBottom:8, display:"block"}}>Find Worker</label>
            {providerStep === "idle" && (
              <div onClick={onSearchClick} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 30, padding: "14px 20px", cursor: "pointer", fontSize: 16, color: "#555" }}>
                🔍 Search Mistri / Provider...
              </div>
            )}
            {providerStep === "category" && (
              <div style={{ position: "relative" }}>
                <input autoFocus placeholder="Write or select category" value={categorySearch} onChange={(e) => { setCategorySearch(e.target.value); setShowCategoryList(true); }} style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ccc" }} />
                {showCategoryList && (
                  <div style={{ position: "absolute", top: 44, left: 0, right: 0, background: "#fff", border: "1px solid #ccc", zIndex: 10, maxHeight: 150, overflowY: "auto" }}>
                    {CATEGORIES.filter((c) => c.en.toLowerCase().includes(categorySearch.toLowerCase())).map((c) => (
                      <div key={c.id} onClick={() => handleCategorySelect(c)} style={{ padding: "6px 12px", cursor: "pointer", borderBottom: "1px solid #eee" }}>{c.en}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {providerStep === "phone" && (
              <div>
                <input autoFocus type="tel" maxLength={10} placeholder="Phone (10-digit)" value={providerPhone} onChange={(e) => setProviderPhone(e.target.value.replace(/\D/g, ""))} style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #ccc" }} />
                {isSaving && <p style={{ color: "green", marginTop: 8 }}>📍 Fetching location, please wait...</p>}
              </div>
            )}
          </div>

          {modalOpen && (
            <div style={styles.modal}>
              <div style={styles.header}>
                <h2 style={styles.title}>
                  <span style={{ color: "#1e88e5" }}>Mistri </span>
                  <span style={{ color: "orange" }}>Bondhu</span>
                </h2>
              </div>
              <div style={styles.btnRow}>
                <button onClick={() => navigate("/worker/login")} style={{...styles.btn, backgroundColor:"#E6F0FF", color:"#1976D2"}}>👷 Worker Login</button>
                <button onClick={() => navigate("/signup/worker")} style={{...styles.btn, backgroundColor:"#E6F0FF", color:"#1976D2"}}>📝 Worker Register</button>
              </div>
              <button onClick={() => setModalOpen(false)} style={styles.closeBtn}>×</button>
            </div>
          )}
        </div>
        <FooterWithLike userId={user?.uid} />
      </>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user.name}</h2>
      <p><b>Role:</b> {user.role}</p>
      {user.role === "admin" && <button onClick={() => navigate("/admin/workers")} style={{ marginTop: 20, padding: 12, borderRadius: 8, background: "#111827", color: "#fff", border: "none", width: "100%", fontSize: 16 }}>🛠 Go to Admin Dashboard</button>}
      {user.role === "worker" && <button onClick={() => navigate("/worker/dashboard")} style={{ marginTop: 20, padding: 12, borderRadius: 8, background: "green", color: "#fff", border: "none", width: "100%", fontSize: 16 }}>👷 Go to Worker Dashboard</button>}
      {user.role === "provider" && <button onClick={() => navigate("/provider/dashboard")} style={{ marginTop: 20, padding: 12, borderRadius: 8, background: "#4A90E2", color: "#fff", border: "none", width: "100%", fontSize: 16 }}>🧑‍💼 Go to Provider Dashboard</button>}
    </div>
  );
}

const styles = {
  header: { textAlign: "center", marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 800 },
  topSection: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logo: { padding: "12px 16px", backgroundColor: "#fff", borderRadius: 10, fontSize: 32, fontWeight: 800, cursor: "pointer" },
  userBox: { display: "flex", gap: 8, padding: "4px 12px", backgroundColor: "#E6F0FF", borderRadius: 8, color: "#1976D2", fontWeight: 600 },
  modal: { position: "fixed", inset: 0, background: "#fff", zIndex: 3000, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30 },
  btnRow: { display: "flex", gap: 20, marginBottom: 30, marginTop: 20 },
  btn: { padding: "12px 24px", fontSize: 18, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer" },
  closeBtn: { position: "absolute", top: 12, right: 12, fontSize: 28, border: "none", background: "none", cursor: "pointer", color: "#FF4D4F" },
};
