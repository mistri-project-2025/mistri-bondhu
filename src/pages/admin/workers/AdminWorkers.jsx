import { useState, useMemo, useEffect } from "react";
import useWorkers from "./hooks/useWorkers";
import WorkerCalendar from "./WorkerCalendar";
import { getCategoryLabel } from "../../../utils/categories";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { CATEGORIES } from "../../../utils/categories";
import { INDIA_STATES, STATE_DISTRICTS, DISTRICT_PS } from "../../../utils/indiaAddress";

export default function AdminWorkers() {
  const { pending, approved, expired, loading, approvePendingWorker, extendApprovedWorker, deleteWorker } = useWorkers();
  const [activeTab, setActiveTab] = useState("pending");
  const [calendarWorker, setCalendarWorker] = useState(null);
  const [isExtend, setIsExtend] = useState(false);
  const [selectedGreat, setSelectedGreat] = useState({});
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState({ open: false, worker: null });
  const [editForm, setEditForm] = useState({});
  const [openField, setOpenField] = useState("");
  const [psList, setPsList] = useState([]);
  const [poList, setPoList] = useState([]);
  const [villageList, setVillageList] = useState([]);
  const [pinMap, setPinMap] = useState({});

  const getList = () => {
    if (activeTab === "pending") return pending;
    if (activeTab === "approved") return approved;
    if (activeTab === "expired") return expired;
    return [];
  };

  const filteredWorkers = useMemo(() => {
    const list = getList();
    if (!search) return list;
    const text = search.toLowerCase();
    return list.filter((w) =>
      w.name?.toLowerCase().includes(text) ||
      w.phone?.toLowerCase().includes(text) ||
      w.pincode?.toLowerCase().includes(text) ||
      w.address?.toLowerCase().includes(text) ||
      w.companyName?.toLowerCase().includes(text) ||
      w.businessName?.toLowerCase().includes(text) ||
      w.category?.toLowerCase().includes(text) ||
      w.street?.toLowerCase().includes(text) ||
      w.state?.toLowerCase().includes(text) ||
      w.dist?.toLowerCase().includes(text) ||
      w.district?.toLowerCase().includes(text) ||
      w.ps?.toLowerCase().includes(text) ||
      w.po?.toLowerCase().includes(text) ||
      w.village?.toLowerCase().includes(text)
    );
  }, [search, activeTab, pending, approved, expired]);

  const filterList = (list, txt) => { if (!list) return []; if (!txt) return list.slice(0, 15); return list.filter(x => x.toLowerCase().includes(txt.toLowerCase())).slice(0, 15); };

  useEffect(() => {
    if (!editForm.dist) { setPsList([]); return; }
    if (DISTRICT_PS[editForm.dist]) setPsList(DISTRICT_PS[editForm.dist]);
    else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=police station ${editForm.dist}&countrycodes=in&limit=20`).then(r=>r.json()).then(data=>{
          const names = data.map(d=>d.display_name.split(",")[0]).filter((v,i,a)=>a.indexOf(v)===i); if (names.length>0) setPsList(names); else setPsList(["Sadar","Kotwali","Town"]);
        }).catch(()=> setPsList(["Sadar","Kotwali","Town"]));
    }
  }, [editForm.dist]);

  useEffect(() => {
    if (!editForm.dist || openField!=="po") return;
    fetch(`https://api.postalpincode.in/postoffice/${editForm.dist}`).then(r=>r.json()).then(d=>{
        if (d[0]?.Status==="Success") {
          const pos = d[0].PostOffice;
          setPoList([...new Set(pos.map(p=>p.Name))].slice(0,30)); const pins = {}; pos.forEach(p=> pins[p.Name]=p.Pincode); setPinMap(pins);
        }
      }).catch(()=>{});
  }, [editForm.dist, openField]);

  const openEditModal = (worker) => {
    setEditForm({
      businessName: worker.businessName || worker.companyName || "", name: worker.name || "", phone: worker.phone || "",
      categoryId: worker.categoryId || "", category: worker.category || "",
      experience: worker.experience || "", street: worker.street || "",
      village: worker.village || "", po: worker.po || "", ps: worker.ps || "",
      pincode: worker.pincode || "", dist: worker.dist || worker.district || "" }); setEditModal({ open: true, worker: worker });
  };

  const handleUpdateWorker = async () => { if (!editModal.worker) return; try {
      const fullAddress = `${editForm.street}, Vill: ${editForm.village}, PO: ${editForm.po}, PS: ${editForm.ps}, PIN: ${editForm.pincode}, DIST: ${editForm.dist}`;
      const updateData = {
        businessName: editForm.businessName, companyName: editForm.businessName,
        name: editForm.name, phone: editForm.phone, categoryId: editForm.categoryId, category: editForm.category,
        experience: editForm.experience, street: editForm.street, village: editForm.village,
        po: editForm.po, ps: editForm.ps, pincode: editForm.pincode, dist: editForm.dist, district: editForm.dist,
        address: fullAddress, updatedAt: new Date().toISOString()
      };
      let ref = doc(db, "workers", editModal.worker.id); let snap = await getDoc(ref); if (!snap.exists()) ref = doc(db, "pendingWorkers", editModal.worker.id);
      await updateDoc(ref, updateData); alert("✅ Worker Updated Successfully!");
      setEditModal({ open: false, worker: null });
    } catch (err) { alert("❌ Error: " + err.message); }
  };

  if (loading) return <p>Loading workers...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h2>👷 Admin Worker Management</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Tab label={`Pending ♥️ (${pending.length})`} active={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
        <Tab label={`Approved 💚 (${approved.length})`} active={activeTab === "approved"} onClick={() => setActiveTab("approved")} />
        <Tab label={`Expired ♠️ (${expired.length})`} active={activeTab === "expired"} onClick={() => setActiveTab("expired")} />
      </div>
      <div style={{ border: "1px solid #ccc", padding: 15, borderRadius: 10, marginBottom: 20, background: "#fafafa" }}>
        <h3>🔎 Search Workers</h3>
        <input type="text" placeholder="Search State / District / PS / PO / Village / Pin / Name / Phone / Business / Category" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
      </div>
      {filteredWorkers.length === 0 && <p>No workers found ❌</p>}
      {filteredWorkers.map((worker) => {
        const categoryName = worker.categoryId? getCategoryLabel(worker.categoryId) : worker.category || "Unknown";
        const displayGroupLabel = worker.groupNo && worker.great? `${categoryName}${worker.groupNo}${worker.great}` : worker.groupLabel || "No Group";
        const daysLeft = worker.contractEnd? Math.ceil((new Date(worker.contractEnd) - new Date())/(1000*60*60*24)) : 0;
        return (
          <div key={worker.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <b>👤 {worker.name}</b><br />📞 {worker.phone}<br />📍 {worker.pincode}<br />🏠 Address: {worker.address || "N/A"}<br />🏢 Business: {worker.companyName || worker.businessName || "N/A"}<br />🛠 {worker.category}<br />
            <p>Group: {displayGroupLabel}</p><p>No: {worker.groupNo}</p>
            {worker.great && <><span>⭐ <b>Great:</b> {worker.great}</span><br /></>}
            {worker.approvalDate && <><span>📅 Approved: {new Date(worker.approvalDate).toLocaleDateString()}</span><br /></>}
            {worker.contractEnd && <><span>⏰ Expire: {new Date(worker.contractEnd).toLocaleDateString()} - {daysLeft} দিন বাকি</span><br /></>}
            <b>Status:</b> {worker.status === "pending"? "♥️ Pending" : worker.status === "approved"? "💚 Approved" : "♠️ Expired"}

            {/* ✅ Great Change for All */}
            <div style={{ marginTop: 8, display: "flex", gap: 5, alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: 12 }}>Great:</label>
              <select value={selectedGreat[worker.id] || worker.great || ""} onChange={(e) => setSelectedGreat((prev) => ({...prev, [worker.id]: e.target.value }))} style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid #2196F3" }}>
                <option value="">Select Great</option>
                <option value="A+">A+ (12 মাস)</option><option value="A">A (1 মাস)</option>
                <option value="B+">B+ (12 মাস)</option><option value="B">B (1 মাস)</option>
                <option value="C+">C+ (12 মাস)</option><option value="C">C (1 মাস)</option>
              </select>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => openEditModal(worker)} style={{ background: "#2196F3", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, fontWeight: "bold" }}>✏️ Edit</button>
              {worker.status === "pending" && <button onClick={() => { const g = selectedGreat[worker.id]; if (!g) { alert("Select Great first"); return; } setCalendarWorker({...worker, great: g }); setIsExtend(false); }} style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>📅 Approve</button>}
              {worker.status === "approved" && <button onClick={() => { const g = selectedGreat[worker.id] || worker.great; if (!g) { alert("Select Great first"); return; } setCalendarWorker({...worker, great: g }); setIsExtend(true); }} style={{ background: "#FF9800", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>⏳ Extend / Change Great</button>}
              {worker.status === "expired" && <button onClick={() => { const g = selectedGreat[worker.id] || worker.great; if (!g) { alert("Select Great first"); return; } setCalendarWorker({...worker, great: g }); setIsExtend(true); }} style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>🔄 Re-Approve / Change Great</button>}
              <button onClick={() => { if (window.confirm("Delete this worker?")) { deleteWorker(worker.id); } }} style={{ color: "red" }}>🗑 Delete</button>
            </div>
          </div>
        );
      })}
      {calendarWorker && <WorkerCalendar worker={calendarWorker} approvePendingWorker={approvePendingWorker} extendApprovedWorker={extendApprovedWorker} isExtend={isExtend} onClose={() => setCalendarWorker(null)} />}
      {editModal.open && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, overflowY: "auto", padding: 15 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 500, borderRadius: 12, padding: 20, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ textAlign: "center" }}>✏️ Edit Worker</h3>
            <label style={{ fontWeight: "bold", fontSize: 13 }}>🏢 1. Business Name</label>
            <input value={editForm.businessName} onChange={(e)=>setEditForm({...editForm, businessName: e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label style={{ fontWeight: "bold", fontSize: 13 }}>👤 2. Name</label>
            <input value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label style={{ fontWeight: "bold", fontSize: 13 }}>📞 3. Phone</label>
            <input value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone: e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label style={{ fontWeight: "bold", fontSize: 13 }}>🛠 4. Category</label>
            <select value={editForm.categoryId} onChange={(e)=>{ const cat = CATEGORIES.find(c=>c.id===e.target.value); setEditForm({...editForm, categoryId: e.target.value, category: cat?.en || ""}); }} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc" }}>
              <option value="">Select Category</option>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.en}</option>)}
            </select>
            <label style={{ fontWeight: "bold", fontSize: 13 }}>💼 5. Experience</label>
            <input value={editForm.experience} onChange={(e)=>setEditForm({...editForm, experience: e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <div style={{ position: "relative" }}>
              <label style={{ fontWeight: "bold", fontSize: 13, color: "#d32f2f" }}>6. State (Street) - রাজ্য - we লিখো</label>
              <input value={editForm.street} onChange={(e)=>{ setEditForm({...editForm, street: e.target.value}); setOpenField("state"); }} onFocus={()=>setOpenField("state")} placeholder="we - West Bengal - India All State" style={{ width: "100%", padding: 10, marginBottom: 2, borderRadius: 6, border: "2px solid #d32f2f" }} />
              {openField==="state" && (<div style={{ border: "2px solid #d32f2f", borderRadius: 6, maxHeight: 180, overflowY: "auto", background: "#fff", position: "absolute", width: "100%", zIndex: 10000, top: "100%" }}>
                  {filterList(INDIA_STATES, editForm.street).map((s,i)=><div key={i} onClick={()=>{ setEditForm({...editForm, street: s, dist: "", ps: "", po: "", village: "", pincode: ""}); setOpenField(""); }} style={{ padding: 10, borderBottom: "1px solid #eee", cursor: "pointer" }}>🌏 {s}</div>)}
                </div>)}
            </div>
            <div style={{ position: "relative", marginTop: 10 }}>
              <label style={{ fontWeight: "bold", fontSize: 13, color: "#FF9800" }}>11. Dist - {editForm.street} এর সব District - pu লিখো</label>
              <input value={editForm.dist} onChange={(e)=>{ setEditForm({...editForm, dist: e.target.value}); setOpenField("dist"); }} onFocus={()=>setOpenField("dist")} placeholder={editForm.street? `Type ${editForm.street} District` : "আগে State Select"} disabled={!editForm.street} style={{ width: "100%", padding: 10, marginBottom: 2, borderRadius: 6, border: "2px solid #FF9800" }} />
              {openField==="dist" && (<div style={{ border: "2px solid #FF9800", borderRadius: 6, maxHeight: 180, overflowY: "auto", background: "#fff", position: "absolute", width: "100%", zIndex: 10000, top: "100%" }}>
                  {filterList(STATE_DISTRICTS[editForm.street] || [], editForm.dist).map((d,i)=><div key={i} onClick={()=>{ setEditForm({...editForm, dist: d, ps: "", po: "", village: "", pincode: ""}); setOpenField(""); }} style={{ padding: 10, borderBottom: "1px solid #eee", cursor: "pointer" }}>🏛️ {d}</div>)}
                </div>)}
            </div>
            <div style={{ position: "relative", marginTop: 10 }}>
              <label style={{ fontWeight: "bold", fontSize: 13 }}>9. P.S - {editForm.dist} এর সব PS</label>
              <input value={editForm.ps} onChange={(e)=>{ setEditForm({...editForm, ps: e.target.value}); setOpenField("ps"); }} onFocus={()=>setOpenField("ps")} placeholder={editForm.dist? `Type ${editForm.dist} PS` : "আগে District Select"} disabled={!editForm.dist} style={{ width: "100%", padding: 10, marginBottom: 2, borderRadius: 6, border: "1px solid #ccc" }} />
              {openField==="ps" && (<div style={{ border: "1px solid #ccc", borderRadius: 6, maxHeight: 180, overflowY: "auto", background: "#fff", position: "absolute", width: "100%", zIndex: 10000, top: "100%" }}>
                  {filterList(psList, editForm.ps).map((p,i)=><div key={i} onClick={()=>{ setEditForm({...editForm, ps: p, po: "", village: "", pincode: ""}); setOpenField(""); }} style={{ padding: 10, borderBottom: "1px solid #eee", cursor: "pointer" }}>🚔 {p}</div>)}
                </div>)}
            </div>
            <div style={{ position: "relative", marginTop: 10 }}>
              <label style={{ fontWeight: "bold", fontSize: 13 }}>8. P.O - {editForm.ps} এর সব PO - Filter Word</label>
              <input value={editForm.po} onChange={(e)=>{ setEditForm({...editForm, po: e.target.value}); setOpenField("po"); }} onFocus={()=>setOpenField("po")} placeholder={editForm.ps? `Type ${editForm.ps} PO` : "আগে PS Select"} disabled={!editForm.dist} style={{ width: "100%", padding: 10, marginBottom: 2, borderRadius: 6, border: "1px solid #ccc" }} />
              {openField==="po" && (<div style={{ border: "1px solid #ccc", borderRadius: 6, maxHeight: 180, overflowY: "auto", background: "#fff", position: "absolute", width: "100%", zIndex: 10000, top: "100%" }}>
                  {filterList(poList, editForm.po).map((p,i)=><div key={i} onClick={()=>{ setEditForm({...editForm, po: p, pincode: pinMap[p] || ""}); setOpenField(""); }} style={{ padding: 10, borderBottom: "1px solid #eee", cursor: "pointer" }}>📮 {p} - PIN: {pinMap[p] || ""}</div>)}
                </div>)}
            </div>
            <label style={{ fontWeight: "bold", fontSize: 13, marginTop: 10, display: "block" }}>10. Pin - Auto</label>
            <input value={editForm.pincode} onChange={(e)=>setEditForm({...editForm, pincode: e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc", background: "#e8f5e9", fontWeight: "bold" }} />
            <div style={{ position: "relative" }}>
              <label style={{ fontWeight: "bold", fontSize: 13, color: "#9C27B0" }}>7. Village - {editForm.po} এর সব Village</label>
              <input value={editForm.village} onChange={(e)=>{ setEditForm({...editForm, village: e.target.value}); setOpenField("village"); }} onFocus={()=>setOpenField("village")} placeholder={editForm.po? `Type ${editForm.po} Village` : "আগে PO Select"} disabled={!editForm.po} style={{ width: "100%", padding: 10, marginBottom: 2, borderRadius: 6, border: "2px solid #9C27B0" }} />
              {openField==="village" && (<div style={{ border: "2px solid #9C27B0", borderRadius: 6, maxHeight: 180, overflowY: "auto", background: "#fff", position: "absolute", width: "100%", zIndex: 10000, top: "100%" }}>
                  {filterList(villageList.length>0? villageList : [editForm.po], editForm.village).map((v,i)=><div key={i} onClick={()=>{ setEditForm({...editForm, village: v}); setOpenField(""); }} style={{ padding: 10, borderBottom: "1px solid #eee", cursor: "pointer" }}>🏘️ {v}</div>)}
                </div>)}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button onClick={handleUpdateWorker} style={{ flex: 1, padding: 12, background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold" }}>✅ Save</button>
              <button onClick={()=>setEditModal({open: false, worker: null})} style={{ flex: 1, padding: 12, background: "#999", color: "#fff", border: "none", borderRadius: 8 }}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Tab({ label, active, onClick }) {
  return <button onClick={onClick} style={{ flex: 1, padding: 12, borderRadius: 8, background: active? "#1f2937" : "#e5e7eb", color: active? "#fff" : "#000", border: "none" }}>{label}</button>;
}
