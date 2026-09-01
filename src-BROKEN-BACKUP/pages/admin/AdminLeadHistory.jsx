// src/pages/admin/AdminLeadHistory.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminLeadHistory() {
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [workersCache, setWorkersCache] = useState({});
  const [allWorkersList, setAllWorkersList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // 1. Load Workers for Search
      const wSnap = await getDocs(collection(db, "workers"));
      const wList = wSnap.docs.map(d => ({ id: d.id, uid: d.id,...d.data() }));
      setAllWorkersList(wList);
      const cache = {};
      wList.forEach(w => { cache[w.id] = w; if(w.uid) cache[w.uid] = w; });
      setWorkersCache(cache);

      // 2. Load Leads + Auto Delete 30 days
      const snap = await getDocs(collection(db, "leads"));
      const now = Date.now();
      const LIMIT = 30 * 24 * 60 * 60 * 1000;
      const validLeads = [];

      for (const d of snap.docs) {
        const data = { id: d.id,...d.data() };
        const timeStr = data.sentAt || data.contactedAt;
        if (timeStr) {
          const age = now - new Date(timeStr).getTime();
          if (age > LIMIT) {
            await deleteDoc(doc(db, "leads", d.id));
            continue;
          }
        }
        validLeads.push(data);
      }
      validLeads.sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
      setAllLeads(validLeads);
      setLeads(validLeads);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    if (!val.trim()) { setLeads(allLeads); return; }

    const q = val.toLowerCase().trim();

    // Worker খুঁজো - name, businessName, phone, address দিয়ে
    const matchedWorkerIds = allWorkersList.filter(w => {
      const name = (w.name || w.fullName || "").toLowerCase();
      const bName = (w.businessName || w.shopName || w.companyName || "").toLowerCase();
      const phone = (w.phone || w.mobile || "").toLowerCase();
      const addr = (w.address || w.area || w.district || "").toLowerCase();
      return name.includes(q) || bName.includes(q) || phone.includes(q) || addr.includes(q);
    }).map(w => [w.id, w.uid].filter(Boolean)).flat();

    // Lead Filter করো - যেই Lead গুলো ওই Worker এর কাছে গেছে
    const filtered = allLeads.filter(l => {
      const sentTo = [...(l.sentTo || []), ...(l.sentToUids || [])].map(String);
      // Worker ID Match
      if (matchedWorkerIds.some(id => sentTo.includes(String(id)))) return true;
      // Provider দিয়েও Search
      const pName = (l.providerName || "").toLowerCase();
      const pPhone = (l.providerPhone || l.phone || "").toLowerCase();
      const pAddr = (l.providerAddress || l.address || "").toLowerCase();
      return pName.includes(q) || pPhone.includes(q) || pAddr.includes(q);
    });

    setLeads(filtered);
  };

  const fetchWorkerDetails = async (lead) => {
    if(expandedId === lead.id) { setExpandedId(null); return; }
    setExpandedId(lead.id);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Lead History - 30 Days Auto Delete</h2>
      
      <div style={{ background: "#fff", padding: 15, borderRadius: 8, marginBottom: 20, border: "2px solid #2196f3", position: "sticky", top: 0, zIndex: 10 }}>
        <input 
          type="text" 
          placeholder="🔍 Worker Search: Name / Business Name / Phone / Address দিয়ে Search করো..." 
          value={search} 
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: "100%", padding: "12px", fontSize: 16, borderRadius: 8, border: "2px solid #ccc" }}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          Total Leads: {leads.length} / {allLeads.length} | Workers DB: {allWorkersList.length} | {search && `Search: "${search}" - ${leads.length} Result`}
        </div>
      </div>

      {leads.length === 0? <p style={{ textAlign: "center", marginTop: 30 }}>❌ "{search}" এর জন্য কোনো Lead পাওয়া যায়নি</p> : leads.map((l) => (
        <div key={l.id} style={{ border: "2px solid #2196f3", padding: 12, borderRadius: 8, marginBottom: 12, background: "#fff" }}>
          <h4>🧑‍💼 Provider: {l.providerName}</h4>
          <p>📞 {l.providerPhone || l.phone} | 📌 {l.providerPincode || l.pincode}</p>
          <p>📍 {l.providerAddress || l.address}</p>
          <p>🏷️ {l.groupLabel} | {l.category} | {l.mode} | ⏰ {new Date(l.sentAt).toLocaleString()}</p>
          <p>👥 {l.sentToCount} Workers</p>

          <button onClick={() => fetchWorkerDetails(l)} style={{ background: expandedId===l.id? "#f44336" : "#4caf50", color: "white", padding: "6px 12px", border: "none", borderRadius: 6, marginTop: 8 }}>
            {expandedId===l.id? "❌ Close" : `👁️ View Workers (${l.sentToCount})`}
          </button>

          {expandedId===l.id && (
            <div style={{ marginTop: 12, background: "#f9f9f9", padding: 10, borderRadius: 6 }}>
              {(l.sentTo || []).map(wid => {
                const w = workersCache[wid];
                return (
                  <div key={wid} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 6, background: search && (w?.name||"").toLowerCase().includes(search.toLowerCase())? "#fff3cd" : "white", borderRadius: 4 }}>
                    {w? (
                      <>
                        <b>👤 {w.name || w.fullName} {w.businessName? `(${w.businessName})` : ""}</b> - 📞 {w.phone || w.mobile}
                        <div style={{ fontSize: 12 }}>📍 {w.address || ""} | 🏷️ {w.categoryId} | {w.groupNo}{w.great} | ⭐ Business: {w.businessName || w.shopName || "-"}</div>
                      </>
                    ) : <>ID: {wid}</>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
