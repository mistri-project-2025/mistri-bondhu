import { useState } from "react";
import useWorkers from "./hooks/useWorkers";
import useWorkerGroups from "./hooks/useWorkerGroups";

export default function WorkerGroupPro() {
  const { approved } = useWorkers();
  const { groups, rebuildAllGroups, fixDuplicateGroups } = useWorkerGroups();
  const [cat, setCat] = useState("Civil Contractor");
  const [great, setGreat] = useState("A+");
  const [autoOn, setAutoOn] = useState(true);

  return (
    <div style={{ marginTop: 15 }}>
      <div style={{ background: "white", borderRadius: 8, padding: 15, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <h3 style={{ color: "#ff5722", marginTop: 0 }}>🔥 PRO GROUP CONTROL PANEL</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{ padding: "8px", borderRadius: 5, border: "1px solid #ccc" }}>
            <option>Civil Contractor</option>
            <option>Electrician</option>
            <option>Plumber</option>
          </select>
          <select value={great} onChange={e=>setGreat(e.target.value)} style={{ padding: "8px", borderRadius: 5, border: "1px solid #ccc" }}>
            <option>A+</option>
            <option>A</option>
            <option>B+</option>
            <option>B</option>
            <option>C</option>
          </select>
          <button onClick={()=>setAutoOn(!autoOn)} style={{ background: autoOn ? "#4caf50" : "#9e9e9e", color: "white", border: "none", padding: "8px 15px", borderRadius: 20 }}>
            {autoOn ? "🟢 AUTO ON" : "⚪ AUTO OFF"}
          </button>
          <button onClick={()=>rebuildAllGroups(approved)} style={{ background: "#ff9800", color: "white", border: "none", padding: "8px 15px", borderRadius: 5, fontWeight: "bold" }}>
            🔄 Rebuild All Groups
          </button>
          <button onClick={fixDuplicateGroups} style={{ background: "#f44336", color: "white", border: "none", padding: "8px 15px", borderRadius: 5 }}>
            Fix 1A+
          </button>
        </div>

        <div style={{ marginTop: 15, background: "#e3f2fd", padding: 10, borderRadius: 5 }}>
          <h4 style={{ margin: "0 0 10px 0" }}>☑️ CHECKBOX MULTI SWAP SYSTEM</h4>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span>Group A</span>
            <select style={{ padding: 5 }}><option>Select Group A</option>{groups.map(g=><option key={g.id}>{g.groupName}</option>)}</select>
            <span>⇄</span>
            <span>Group B</span>
            <select style={{ padding: 5 }}><option>Select Group B</option>{groups.map(g=><option key={g.id}>{g.groupName}</option>)}</select>
            <button style={{ background: "#9e9e9e", color: "white", border: "none", padding: "6px 12px", borderRadius: 5 }}>Select Both Groups</button>
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <h4>🌳 Group Tree - {groups.length} Groups | {approved.length} Workers</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10, marginTop: 10 }}>
            {groups.map(g => (
              <div key={g.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 8, background: "#fafafa" }}>
                <b>{g.groupName}</b>
                <div style={{ fontSize: 12, color: "#666" }}>{g.workers?.length || 0} workers - {g.great}</div>
                <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {g.workers?.slice(0,5).map(wId => {
                    const w = approved.find(a=>a.id===wId);
                    return <span key={wId} style={{ background: "#e0e0e0", padding: "2px 5px", borderRadius: 3, fontSize: 10 }}>{w?.name || wId.slice(0,5)}</span>
                  })}
                </div>
              </div>
            ))}
            {groups.length===0 && <div style={{ padding: 20, textAlign: "center", color: "#999", gridColumn: "1/-1" }}>No groups yet. Click Rebuild All Groups</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
