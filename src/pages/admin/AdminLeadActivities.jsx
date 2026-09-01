import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminLeadActivities() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    const snap = await getDocs(collection(db, "leadActivities"));
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a,b) => {
      const ta = a.createdAt || (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const tb = b.createdAt || (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      // handle firestore timestamp object
      const tA = typeof ta === 'number' ? ta : ta?.toDate ? ta.toDate().getTime() : new Date(ta).getTime();
      const tB = typeof tb === 'number' ? tb : tb?.toDate ? tb.toDate().getTime() : new Date(tb).getTime();
      return tB - tA;
    });
    setActivities(data);
  };

  useEffect(() => { load(); }, []);

  // Counts
  const totalViewed = activities.filter(a => a.action === "viewed_lead").length;
  const totalCall = activities.filter(a => a.action === "contacted_call").length;
  const totalWhatsapp = activities.filter(a => a.action === "contacted_whatsapp").length;
  const totalProviderCall = activities.filter(a => a.type?.includes("PROVIDER_TO_WORKER")).length;

  const filtered = activities.filter(a => {
    const allFields = `${a.workerName||''} ${a.workerCompany||''} ${a.workerPhone||''} ${a.workerAddress||''} ${a.workerPincode||''} ${a.workerVillage||''} ${a.workerState||''} ${a.workerDistrict||''} ${a.providerName||''} ${a.providerPhone||''} ${a.action||''} ${a.type||''}`.toLowerCase();
    const okSearch = search === "" || allFields.includes(search.toLowerCase());

    let okFilter = true;
    if(filter === "VIEWED") okFilter = a.action === "viewed_lead";
    else if(filter === "CALL") okFilter = a.action === "contacted_call";
    else if(filter === "WHATSAPP") okFilter = a.action === "contacted_whatsapp";
    else if(filter === "WORKER") okFilter = a.type?.includes("WORKER_TO_PROVIDER");
    else if(filter === "PROVIDER") okFilter = a.type?.includes("PROVIDER_TO_WORKER");
    else if(filter === "NOT_CONTACTED") okFilter = a.action === "viewed_lead";

    return okSearch && okFilter;
  });

  const getDate = (a) => {
    if (a.createdAt?.toDate) return a.createdAt.toDate().toLocaleString();
    if (a.timestamp) return new Date(a.timestamp).toLocaleString();
    if (a.createdAt) return new Date(a.createdAt).toLocaleString();
    return "";
  };

  return (
    <div style={{ padding: 15 }}>
      <h3>Admin - Lead Activities Live</h3>
      
      {/* DASHBOARD COUNTS */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 15 }}>
        <div style={{ background: "#000", color: "#fff", padding: "10px 14px", borderRadius: 8 }}><b>ALL: {activities.length}</b></div>
        <div style={{ background: "#9C27B0", color: "#fff", padding: "10px 14px", borderRadius: 8 }}>👁️ Viewed: {totalViewed}</div>
        <div style={{ background: "#2196F3", color: "#fff", padding: "10px 14px", borderRadius: 8 }}>📞 Call: {totalCall}</div>
        <div style={{ background: "#4CAF50", color: "#fff", padding: "10px 14px", borderRadius: 8 }}>💬 WhatsApp: {totalWhatsapp}</div>
        <div style={{ background: "#FF9800", color: "#fff", padding: "10px 14px", borderRadius: 8 }}>Provider→Worker: {totalProviderCall}</div>
      </div>

      <input
        value={search}
        onChange={e=>setSearch(e.target.value)}
        placeholder="Search State / District / Village / Pin / Name / Phone..."
        style={{ width: "100%", padding: 12, marginBottom: 10, border: "2px solid #1e88e5", borderRadius: 6 }}
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {[
          {k:"ALL", l:`All (${activities.length})`, c:"black"},
          {k:"VIEWED", l:`Viewed 👁️ (${totalViewed})`, c:"#9C27B0"},
          {k:"CALL", l:`Call 📞 (${totalCall})`, c:"#2196F3"},
          {k:"WHATSAPP", l:`WhatsApp 💬 (${totalWhatsapp})`, c:"#4CAF50"},
          {k:"WORKER", l:"Worker Only", c:"#1e88e5"},
          {k:"PROVIDER", l:"Provider Only", c:"#ff5722"},
        ].map(b => (
          <button key={b.k} onClick={()=>setFilter(b.k)} style={{ padding: "8px 14px", background: filter===b.k?b.c:"#eee", color: filter===b.k?"white":"black", borderRadius: 20, border: "none", fontWeight: filter===b.k?"bold":"normal" }}>{b.l}</button>
        ))}
        <button onClick={load} style={{ padding: "8px 14px", marginLeft: "auto", borderRadius: 20, border: "none", background: "#eee" }}>🔄 Refresh</button>
      </div>

      {filtered.map(a => {
        const isProvider = a.type?.includes("PROVIDER_TO_WORKER");
        const isViewed = a.action === "viewed_lead";
        const isCall = a.action === "contacted_call";
        const isWapp = a.action === "contacted_whatsapp";
        return (
          <div key={a.id} style={{ borderLeft: `6px solid ${isViewed? "#9C27B0" : isCall? "#2196F3" : isWapp? "#4CAF50" : isProvider? "#ff5722" : "#ccc"}`, border: "1px solid #ddd", padding: 12, marginBottom: 10, borderRadius: 8, background: isViewed? "#f3e5f5" : isCall? "#e3f2fd" : isWapp? "#e8f5e9" : "#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap" }}>
              <b style={{ color: isViewed? "#9C27B0" : isCall? "#1565c0" : "#2e7d32" }}>
                {isViewed? "👁️ VIEWED LEAD" : isCall? "📞 CONTACTED CALL" : isWapp? "💬 CONTACTED WHATSAPP" : a.action} 
              </b>
              <small>{getDate(a)}</small>
            </div>
            <div style={{ fontSize: 11, background: "#eee", display:"inline-block", padding: "2px 8px", borderRadius: 10, marginTop: 4 }}>{a.type}</div>
            
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: "18px" }}>
              <div style={{ background: "#e3f2fd", padding: 8, borderRadius: 6, marginBottom: 6 }}>
                <b>👷 Worker:</b> {a.workerName || a.workerCompany || "-"} <br/>
                📞 {a.workerPhone || "-"} <br/>
                📍 {a.workerAddress || `${a.workerVillage||''} ${a.workerDistrict||''} ${a.workerState||''}`.trim() || "-"} 
                {a.workerPincode? ` - Pin: ${a.workerPincode}` : ""} <br/>
                🏷️ {a.workerCategory || ""} {a.workerCompany? `| ${a.workerCompany}` : ""}
              </div>

              <div style={{ background: "#fff3e0", padding: 8, borderRadius: 6 }}>
                <b>🏠 Provider:</b> {a.providerName || "-"} <br/>
                📞 {a.providerPhone || "-"} <br/>
                📍 {a.providerAddress || "-"} {a.providerPincode? ` - Pin: ${a.providerPincode}` : ""}
              </div>

              {isViewed && <div style={{ marginTop: 6, color: "#9C27B0", fontWeight: "bold", fontSize: 12 }}>⚠️ Worker Lead দেখেছে কিন্তু এখনো Call/WhatsApp করেনি - NOT CONTACTED</div>}
            </div>
          </div>
        );
      })}
      {filtered.length===0 && <p style={{ textAlign: "center", color: "red" }}>No records found</p>}
    </div>
  );
}
