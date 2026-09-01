import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function WorkerLeads({ uid }) {
  const [leads, setLeads] = useState([]);
  const [worker, setWorker] = useState(null);
  const [activities, setActivities] = useState([]);
  const [providersMap, setProvidersMap] = useState({});

  const formatDateTime = (l) => {
    try {
      const raw = l.sentAt || l.createdAt || l.timestamp || l.date;
      if (!raw) return "";
      let d = null;
      if (typeof raw === "number") d = new Date(raw);
      else if (typeof raw === "string") d = new Date(raw);
      else if (raw?.toDate) d = raw.toDate();
      else if (raw?.seconds) d = new Date(raw.seconds * 1000);
      if (!d || isNaN(d.getTime())) return "";
      return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
    } catch { return ""; }
  };

  useEffect(() => {
    const loadWorker = async () => {
      try {
        let snap = await getDoc(doc(db, "workers", uid));
        if (!snap.exists()) snap = await getDoc(doc(db, "pendingWorkers", uid));
        if (snap.exists()) setWorker(snap.data());
      } catch (e) { console.log(e); }
    };
    if (uid) loadWorker();
  }, [uid]);

  const loadAll = async () => {
    const snap = await getDocs(collection(db, "leads"));
    let allLeads = snap.docs.map(d => ({ id: d.id,...d.data() }));
    const filtered = allLeads.filter(l => l.workerId === uid || l.sentTo?.includes(uid));
    filtered.sort((a,b)=>{
      const ta = new Date(a.sentAt || a.createdAt || 0).getTime();
      const tb = new Date(b.sentAt || b.createdAt || 0).getTime();
      return tb - ta;
    });

    const provSnap = await getDocs(collection(db, "providers"));
    const pMap = {};
    provSnap.docs.forEach(d => { pMap[d.id] = { id: d.id,...d.data() }; });
    setProvidersMap(pMap);

    const actSnap = await getDocs(query(collection(db, "leadActivities"), where("workerId", "==", uid)));
    const actList = actSnap.docs.map(d => d.data());
    setActivities(actList);
    setLeads(filtered);
  };

  useEffect(() => {
    if (!uid) return;
    loadAll();
  }, [uid, worker]);

  const isViewed = (leadId) => activities.some(a => a.leadId === leadId && a.action === "viewed_lead");
  const isCalled = (leadId) => activities.some(a => a.leadId === leadId && a.action === "contacted_call");
  const isWhatsapp = (leadId) => activities.some(a => a.leadId === leadId && a.action === "contacted_whatsapp");
  const isContacted = (leadId) => isCalled(leadId) || isWhatsapp(leadId);

  const newLeadsCount = leads.filter(l =>!isViewed(l.id)).length;
  const contactedCount = leads.filter(l => isContacted(l.id)).length;

  const logToAdmin = async (lead, action, type) => {
    if (!uid ||!worker) return;
    const pData = providersMap[lead.providerId];
    const id = action + "_" + Date.now() + "_" + lead.id;
    await setDoc(doc(db, "leadActivities", id), {
      workerId: uid,
      workerName: worker.name || "",
      workerCompany: worker.companyName || worker.businessName || "",
      workerPhone: worker.phone || "",
      workerAddress: `${worker.village || ""} ${worker.ps || ""} ${worker.district || ""} ${worker.state || ""}`.trim() || worker.address || "",
      workerVillage: worker.village || "",
      workerPincode: worker.pincode || "",
      workerState: worker.state || "",
      workerDistrict: worker.district || "",
      workerCategory: worker.categoryId || worker.category || "",
      leadId: lead.id,
      providerId: lead.providerId || "",
      providerName: pData?.name || pData?.companyName || lead.providerName || "Provider",
      providerPhone: pData?.phone || lead.providerPhone || "",
      providerPincode: pData?.pincode || "",
      providerAddress: pData?.village || pData?.address || "",
      action: action,
      type: type,
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
    });
    loadAll();
  };

  const handleView = (lead) => {
    if (!isViewed(lead.id)) {
      logToAdmin(lead, "viewed_lead", "WORKER_VIEWED_LEAD");
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#eee", padding: 10, borderRadius: 8, flex: 1 }}><b>Total: {leads.length}</b></div>
        <div style={{ background: "#ffeb3b", padding: 10, borderRadius: 8, flex: 1 }}><b>New: {newLeadsCount}</b></div>
        <div style={{ background: "#c8e6c9", padding: 10, borderRadius: 8, flex: 1 }}><b>Contacted: {contactedCount}</b></div>
      </div>

      <h3>My Leads</h3>
      {leads.map(l => {
        const pData = providersMap[l.providerId];
        const viewed = isViewed(l.id);
        const called = isCalled(l.id);
        const wapp = isWhatsapp(l.id);
        return (
          <div key={l.id} onClick={() => handleView(l)} style={{
            border: isContacted(l.id)? "2px solid green" :!viewed? "2px solid orange" : "2px solid #ccc",
            background:!viewed? "#fff9c4" : "white",
            padding: 12, marginBottom: 12, borderRadius: 10
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>{pData?.name || l.providerName || "Provider"}</b>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background:!viewed? "orange" : isContacted(l.id)? "green" : "#ddd", color:!viewed || isContacted(l.id)? "white" : "black" }}>
                {!viewed? "NEW" : isContacted(l.id)? "CONTACTED" : "VIEWED"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>🕒 {formatDateTime(l)}</div>
            <div style={{ fontSize: 13, color: "#5D4037", fontWeight: "bold", marginTop: 4 }}>🏷️ {l.searchedCategory || l.category || l.categoryId || pData?.categoryId || pData?.category || "Category"}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{pData?.village || l.providerAddress || ""} {pData?.district || ""}</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {called && <span style={{ color: "blue", marginRight: 8 }}>✓ Called</span>}
              {wapp && <span style={{ color: "green" }}>✓ WhatsApp</span>}
              {!isContacted(l.id) && <span style={{ color: "red" }}>• Not Contacted Yet</span>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={async (e) => { e.stopPropagation(); const pd = providersMap[l.providerId]; const phone = pd?.phone || l.providerPhone || l.phone; if(!phone) return alert("No Number"); await logToAdmin(l, "contacted_call", "WORKER_TO_PROVIDER_CALL"); window.location.href=`tel:${phone}`; }}
              style={{ background: called? "#0d47a1" : "blue", color: "white", padding: 10, flex: 1, border: "none", borderRadius: 6 }}>📞 Call Now</button>
              <button onClick={async (e) => { e.stopPropagation(); const pd = providersMap[l.providerId]; const phone = pd?.phone || l.providerPhone || l.phone; if(!phone) return alert("No Number"); await logToAdmin(l, "contacted_whatsapp", "WORKER_TO_PROVIDER_WHATSAPP"); const num = phone.replace(/\D/g,"").slice(-10); window.open(`https://wa.me/91${num}`); }}
              style={{ background: wapp? "#1b5e20" : "green", color: "white", padding: 10, flex: 1, border: "none", borderRadius: 6 }}>💬 WhatsApp</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
