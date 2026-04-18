import { useEffect, useState } from "react";
import { doc, getDocs } from "firebase/firestore";
import { leadsCollection } from "../../firebase/config";

export default function WorkerLeads({ uid }) {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    if (!uid) return;
    getDocs(leadsCollection).then((snap) => {
      const now = Date.now();
      const LIMIT = 30 * 24 * 60 * 60 * 1000;
      const filtered = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (l) => l.workerId === uid && l.approved === true && now - new Date(l.contactedAt).getTime() <= LIMIT
        );
      setLeads(filtered);
    });
  }, [uid]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>📞 Recent Leads</h3>
      {leads.length === 0 ? <p>No leads yet</p> : leads.map((l) => <div key={l.id}>{l.providerName} — 📞 {l.providerPhone}</div>)}
    </div>
  );
}
