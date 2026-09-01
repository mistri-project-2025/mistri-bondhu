import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function WorkerLeads({ uid }) {
  const [leads, setLeads] = useState([]);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const loadWorker = async () => {
      try {
        let snap = await getDoc(doc(db, "workers", uid));
        if(!snap.exists()) snap = await getDoc(doc(db, "pendingWorkers", uid));
        if(snap.exists()) setWorker(snap.data());
      } catch(e){ console.log(e); }
    };
    if(uid) loadWorker();
  }, [uid]);

  const logToAdmin = async (lead, action) => {
    if(!uid ||!worker) return;
    const id = Date.now().toString() + "_" + uid.slice(0,5);
    await setDoc(doc(db, "leadActivities", id), {
      workerId: uid,
      workerName: worker.name || "",
      workerCompany: worker.companyName || worker.businessName || "",
      workerPhone: worker.phone || "",
      workerAddress: worker.address || "",
      workerPincode: worker.pincode || "",
      workerCategory: worker.categoryId || "",
      leadId: lead.id,
      providerName: lead.providerName || lead.name || "",
      providerPhone: lead.providerPhone || lead.phone || "",
      providerPincode: lead.providerPincode || lead.pincode || "",
      providerAddress: lead.providerAddress || lead.address || "",
      action: action,
      type: "WORKER_TO_PROVIDER",
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
    });
  };

  useEffect(() => {
    if(!uid) return;
    const load = async () => {
      const snap = await getDocs(collection(db, "leads"));
      const filtered = snap.docs.map(d => ({ id: d.id,...d.data() })).filter(l => l.sentTo?.includes(uid));
      setLeads(filtered);
    };
    load();
  }, [uid]);

  return (
    <div>
      <h3>Leads ({leads.length})</h3>
      {leads.map(l => (
        <div key={l.id} style={{ border: "2px solid blue", padding: 10, marginBottom: 10, borderRadius: 8 }}>
          <b>{l.providerName || "Provider"}</b> - 📞 {l.providerPhone || l.phone}<br/>
          <button onClick={async ()=>{ await logToAdmin(l, "contacted_call"); window.location.href=`tel:${l.providerPhone || l.phone}`; }} style={{ background: "blue", color: "white", padding: 8, width: "48%", marginRight: "4%" }}>📞 Call</button>
          <button onClick={async ()=>{ await logToAdmin(l, "contacted_whatsapp"); window.open(`https://wa.me/91${(l.providerPhone||l.phone||"").replace(/\D/g,"").slice(-10)}`); }} style={{ background: "green", color: "white", padding: 8, width: "48%" }}>WhatsApp</button>
        </div>
      ))}
    </div>
  );
}
