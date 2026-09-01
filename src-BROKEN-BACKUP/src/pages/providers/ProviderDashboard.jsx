// src/pages/provider/ProviderDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useProviderWorkers from "./hooks/useProviderWorkers";
import { getCategoryLabel, CATEGORIES } from "../../utils/categories";
import { recordProviderContact } from "../../firebase/search";
import { checkWorkerExpiry } from "../../utils/checkWorkerExpiry";
import FooterWithLike from "../../components/FooterWithLike";
import ProviderFeedback from "./ProviderFeedback";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const { workers, loading } = useProviderWorkers(categoryId);

  useEffect(() => { checkWorkerExpiry(); }, []);

  if (!user || user.role!== "provider") {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Provider login required</p>;
  }

  const handleSearch = () => {
    if (!searchText) { alert("Please enter a category to search"); return; }
    const matched = CATEGORIES.filter(c => c.en.toLowerCase().includes((searchText || "").toLowerCase()));
    if (matched.length === 0) { setCategoryId(null); alert("No category matched"); return; }
    setCategoryId(matched[0].id);
  };

  // 🔥 NEW FULL LOGGING - PROVIDER TO WORKER
  const logProviderToWorker = async (w, actionType) => {
    try {
      // পুরানো record টাও রাখলাম
      await recordProviderContact(user, [w]);

      // নতুন leadActivities এ Full Details
      const id = Date.now().toString() + "_" + w.id.slice(0,5);
      await setDoc(doc(db, "leadActivities", id), {
        workerId: w.id || w.uid,
        workerName: w.name || "",
        workerCompany: w.companyName || w.businessName || "",
        workerPhone: w.phone || "",
        workerAddress: w.address || "",
        workerPincode: w.pincode || "",
        workerCategory: w.categoryId || "",
        providerId: user.uid,
        providerName: user.displayName || user.name || "Provider",
        providerPhone: user.phoneNumber || user.phone || "",
        providerAddress: user.address || "",
        leadId: w.id,
        action: actionType, // PROVIDER_TO_WORKER_CALL / WHATSAPP
        type: "PROVIDER_TO_WORKER",
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
      });
      console.log("✅ Provider contact logged");
    } catch(e){ console.error("Log Error:", e); }
  };

  const callWorker = async (w) => {
    await logProviderToWorker(w, "PROVIDER_TO_WORKER_CALL");
    window.location.href = `tel:${w.phone}`;
  };

  const whatsappWorker = async (w) => {
    await logProviderToWorker(w, "PROVIDER_TO_WORKER_WHATSAPP");
    window.open(`https://wa.me/${w.phone.replace(/\D/g, "")}`, "_blank");
  };

  const filteredCategories = CATEGORIES.filter(c => c.en.toLowerCase().includes((searchText || "").toLowerCase()));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}><span style={{ color: "#1e88e5" }}>Mistri </span><span style={{ color: "orange" }}>Bondhu</span></h1>
          <div style={styles.subHeader}>
            <div style={styles.logoLeft} onClick={() => setShowFeedback(true)}><span style={{ color: "#1e88e5" }}>M</span><span style={{ color: "orange" }}>B</span></div>
            <p style={styles.welcome}>Welcome Provider</p>
          </div>
        </div>

        <div style={styles.searchBox}>
          <input placeholder="Enter Category (e.g., mason)" value={searchText} onChange={(e) => setSearchText(e.target.value)} onFocus={() => setShowCategoryList(true)} style={styles.searchInput} />
          <br /><br />
          <button onClick={handleSearch} style={styles.btn}>🔎 Search Workers</button>
          {showCategoryList && searchText && (
            <div style={styles.popup}>
              {filteredCategories.map((c) => (
                <div key={c.id} style={styles.popupItem} onClick={() => { setSearchText(c.en); setCategoryId(c.id); setShowCategoryList(false); }}>{c.en}</div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.list}>
          {loading && <p style={{ textAlign: "center" }}>Loading workers...</p>}
          {!loading && workers.length === 0 && categoryId && <p style={{ textAlign: "center" }}>No workers found 😕</p>}
          {workers.map((w) => (
            <div key={w.id} style={styles.card}>
              <b>{w.name}</b>
              <p>📞 {w.phone}</p>
              <p>🛠 {getCategoryLabel(w.categoryId)}</p>
              <p>📍 {w.pincode || "-"}</p>
              <div>
                <button style={styles.btn} onClick={() => callWorker(w)}>📞 Call</button>
                <button style={{...styles.btn, marginLeft: 8, background: "#25D366" }} onClick={() => whatsappWorker(w)}>💬 WhatsApp</button>
              </div>
            </div>
          ))}
        </div>

        <FooterWithLike userId={user.uid} />
        <button style={styles.closeBtn} onClick={() => navigate("/")}>✖</button>
        {showFeedback && <ProviderFeedback uid={user.uid} onClose={() => setShowFeedback(false)} />}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f7f7f7", paddingBottom: 80, display: "flex", justifyContent: "center" },
  container: { width: "100%", maxWidth: 600, padding: 16, margin: "0 auto" },
  header: { paddingBottom: 16, textAlign: "center" },
  subHeader: { display: "flex", justifyContent: "center", gap: 16, alignItems: "center" },
  logoLeft: { background: "#fff", padding: "10px 14px", borderRadius: 8, fontSize: 28, cursor: "pointer" },
  title: { fontSize: "2rem", margin: 0 },
  welcome: { color: "#1e88e5", fontSize: 18 },
  searchBox: { paddingBottom: 16, position: "relative" },
  searchInput: { width: "100%", padding: 12, fontSize: 16, borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" },
  btn: { padding: "8px 16px", background: "#1e88e5", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", marginTop: 8 },
  popup: { position: "absolute", top: 55, left: 0, right: 0, background: "#fff", border: "1px solid #ccc", maxHeight: 180, overflowY: "auto", zIndex: 1000 },
  popupItem: { padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #eee" },
  list: { paddingTop: 16 },
  card: { background: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 },
  closeBtn: { position: "fixed", bottom: 70, right: 16, borderRadius: "50%", background: "#ff5252", color: "#fff", border: "none", padding: "10px 14px" },
};
