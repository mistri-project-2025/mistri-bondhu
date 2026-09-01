import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminLeadActivities() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("ALL"); // ALL, WORKER, PROVIDER

  const load = async () => {
    const snap = await getDocs(collection(db, "leadActivities"));
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a,b) => {
      const ta = a.createdAt || (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const tb = b.createdAt || (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return tb - ta;
    });
    setActivities(data);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = () => {
    if(viewMode === "ALL") setViewMode("WORKER");
    else if(viewMode === "WORKER") setViewMode("PROVIDER");
    else setViewMode("ALL");
  };

  const filtered = activities.filter(a => {
    const allFields = `
      ${a.workerName||''} ${a.workerCompany||''} ${a.workerPhone||''} 
      ${a.workerAddress||''} ${a.workerPincode||''}
      ${a.providerName||''} ${a.providerPhone||''}
      ${a.action||''} ${a.type||''}
    `.toLowerCase();
    
    const okSearch = search === "" || allFields.includes(search.toLowerCase());
    
    const action = (a.action || "").toLowerCase();
    const type = (a.type || "").toLowerCase();
    
    let okFilter = false;
    if(filter === "ALL") okFilter = true;
    else if(filter === "CALL") okFilter = action.includes("call");
    else if(filter === "WHATSAPP") okFilter = action.includes("whatsapp");

    let okViewMode = true;
    if(viewMode === "WORKER") okViewMode = type.includes("worker_to_provider") || action.includes("contacted");
    else if(viewMode === "PROVIDER") okViewMode = type.includes("provider_to_worker");
    
    return okSearch && okFilter && okViewMode;
  });

  return (
    <div style={{ padding: 15 }}>
      <h3>Worker Lead Activity - Live Tracking</h3>
      <p>Total: {filtered.length} | Mode: {viewMode}</p>

      <input 
        value={search} 
        onChange={e=>setSearch(e.target.value)} 
        placeholder="Search any field - Name, Company, Phone, Pin..." 
        style={{ width: "100%", padding: 12, marginBottom: 10, border: "2px solid #1e88e5", borderRadius: 6 }} 
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <button onClick={()=>setFilter("ALL")} style={{ padding: "8px 14px", background: filter==="ALL"?"black":"#eee", color: filter==="ALL"?"white":"black", borderRadius: 5, border: "none" }}>All</button>
        <button onClick={()=>setFilter("CALL")} style={{ padding: "8px 14px", background: filter==="CALL"?"blue":"#ddd", color: filter==="CALL"?"white":"black", borderRadius: 5, border: "none" }}>Call</button>
        <button onClick={()=>setFilter("WHATSAPP")} style={{ padding: "8px 14px", background: filter==="WHATSAPP"?"green":"#ddd", color: filter==="WHATSAPP"?"white":"black", borderRadius: 5, border: "none" }}>WhatsApp</button>
        
        <button onClick={handleToggle} style={{ padding: "8px 14px", background: "#ff5722", color: "white", borderRadius: 5, border: "none", fontWeight: "bold" }}>
          {viewMode === "ALL" ? "ALL - Toggle" : viewMode === "WORKER" ? "Worker Only" : "Provider Only"}
        </button>

        <button onClick={load} style={{ padding: "8px 14px", marginLeft: "auto", borderRadius: 5, border: "none" }}>Refresh</button>
      </div>

      <p style={{ fontSize: 11, color: "#666" }}>
        Toggle chaple: ALL - sob record, Worker Only - sudu worker ra call koreche, Provider Only - sudu provider ra call koreche
      </p>

      {filtered.map(a => (
        <div key={a.id} style={{ borderLeft: `4px solid ${a.type?.includes("PROVIDER")?"#ff5722":"#1e88e5"}`, border: "1px solid #ddd", padding: 10, marginBottom: 8, borderRadius: 6, background: "#fff" }}>
          <b>{a.action}</b> - <small>{a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}</small><br/>
          <span style={{ background: a.type?.includes("PROVIDER")?"#ffe0d6":"#d6eaff", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{a.type}</span><br/>
          Worker: <b>{a.workerName}</b> - {a.workerPhone} | {a.workerAddress}<br/>
          Provider: {a.providerName} - {a.providerPhone}
        </div>
      ))}
      {filtered.length===0 && <p style={{ textAlign: "center", color: "red" }}>No records</p>}
    </div>
  );
}
