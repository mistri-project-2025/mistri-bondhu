import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { rebuildAllGroups as rebuildAutoGroups } from "../../../firebase/rebuildGroupService";
import { swapGroups } from "../../../firebase/groupSwapService";
import { db } from "../../../firebase/config";
import { CATEGORIES, getCategoryLabel } from "../../../utils/categories";

export default function WorkerGroupPro() {
  const [workers, setWorkers] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [great, setGreat] = useState("");
  const [selected, setSelected] = useState(null);
  const [autoMode, setAutoMode] = useState(true);
  const [swapGroupA, setSwapGroupA] = useState("");
  const [swapGroupB, setSwapGroupB] = useState("");
  const [selectedWorkersA, setSelectedWorkersA] = useState([]);
  const [selectedWorkersB, setSelectedWorkersB] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id,...d.data() }));
      setWorkers(list);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      if (categoryId && w.categoryId!== categoryId) return false;
      if (great && w.great!== great) return false;
      return true;
    });
  }, [workers, categoryId, great]);

  const groups = useMemo(() => {
    const map = {};
    filtered.forEach((w) => {
      const key = w.groupLabel || "UNGROUPED";
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [filtered]);

  const groupKeys = Object.keys(groups);

  const toggleWorkerSelection = (workerId, groupKey) => {
    if (groupKey === swapGroupA) {
      setSelectedWorkersA((prev) => prev.includes(workerId)? prev.filter((id) => id!== workerId) : [...prev, workerId]);
    } else if (groupKey === swapGroupB) {
      setSelectedWorkersB((prev) => prev.includes(workerId)? prev.filter((id) => id!== workerId) : [...prev, workerId]);
    }
  };

  const canSwap = swapGroupA && swapGroupB && swapGroupA!== swapGroupB && selectedWorkersA.length > 0 && selectedWorkersA.length === selectedWorkersB.length;

  const getSwapButtonText = () => {
    if (!swapGroupA ||!swapGroupB) return "Select Both Groups";
    if (swapGroupA === swapGroupB) return "Select Different Groups";
    if (selectedWorkersA.length === 0 && selectedWorkersB.length === 0) return "Select Workers";
    if (selectedWorkersA.length!== selectedWorkersB.length) return `❌ Select Equal Workers (${selectedWorkersA.length} vs ${selectedWorkersB.length})`;
    return `🔄 SWAP ${selectedWorkersA.length} Workers`;
  };

  const handleSwap = async () => {
    if (!canSwap) return;
    const confirm = window.confirm(`Swap ${selectedWorkersA.length} workers between ${swapGroupA} and ${swapGroupB}?`);
    if (!confirm) return;
    try {
      const res = await swapGroups(selectedWorkersA, selectedWorkersB, swapGroupA, swapGroupB);
      if (res.success) {
        alert("🔥 Swap Done Successfully!");
        setSelectedWorkersA([]); setSelectedWorkersB([]); setSwapGroupA(""); setSwapGroupB("");
      } else { alert("❌ Failed: " + res.error); }
    } catch (err) { alert("❌ Error: " + err.message); }
  };

  const moveWorker = async (worker, newGroup) => {
    await updateDoc(doc(db, "workers", worker.id), { groupLabel: newGroup, updatedAt: new Date().toISOString() });
  };

  const exchange = async (a, b) => {
    if (!a ||!b) return;
    await updateDoc(doc(db, "workers", a.id), { groupLabel: b.groupLabel });
    await updateDoc(doc(db, "workers", b.id), { groupLabel: a.groupLabel });
    setSelected(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 PRO GROUP CONTROL PANEL</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Category</option>
          {CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.en}</option>))}
        </select>
        <select onChange={(e) => setGreat(e.target.value)}>
          <option value="">All Great</option><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C+</option><option>C</option>
        </select>
        <button onClick={() => setAutoMode(!autoMode)}>{autoMode? "🟢 AUTO ON" : "🟡 MANUAL"}</button>
        <button onClick={async () => {
          const res = await rebuildAutoGroups();
          if (res.success) { alert("🔥 All Groups Rebuilt Successfully!"); window.location.reload(); } else { alert("❌ Failed: " + res.error); }
        }} style={{ padding: "8px 12px", background: "#ff5722", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>🔄 Rebuild All Groups</button>
      </div>
      <hr />
      <h3>🔄 CHECKBOX MULTI SWAP SYSTEM</h3>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: 15, background: "#f5f5f5", borderRadius: 8 }}>
        <div>
          <label style={{ fontSize: 12, color: "#666" }}>Group A</label>
          <select value={swapGroupA} onChange={(e) => { setSwapGroupA(e.target.value); setSelectedWorkersA([]); }} style={{ padding: 8, minWidth: 120 }}>
            <option value="">Select Group A</option>
            {groupKeys.map((g) => { const firstWorker = groups[g][0]; const displayLabel = firstWorker? `${getCategoryLabel(firstWorker.categoryId)}${firstWorker.groupNo}${firstWorker.great}` : g; return (<option key={g} value={g}>{displayLabel}</option>); })}
          </select>
          {swapGroupA && (<div style={{ fontSize: 12, marginTop: 4, color: "blue" }}>Selected: {selectedWorkersA.length}</div>)}
        </div>
        <div style={{ fontSize: 24 }}>⇄</div>
        <div>
          <label style={{ fontSize: 12, color: "#666" }}>Group B</label>
          <select value={swapGroupB} onChange={(e) => { setSwapGroupB(e.target.value); setSelectedWorkersB([]); }} style={{ padding: 8, minWidth: 120 }}>
            <option value="">Select Group B</option>
            {groupKeys.map((g) => { const firstWorker = groups[g][0]; const displayLabel = firstWorker? `${getCategoryLabel(firstWorker.categoryId)}${firstWorker.groupNo}${firstWorker.great}` : g; return (<option key={g} value={g}>{displayLabel}</option>); })}
          </select>
          {swapGroupB && (<div style={{ fontSize: 12, marginTop: 4, color: "green" }}>Selected: {selectedWorkersB.length}</div>)}
        </div>
        <button onClick={handleSwap} disabled={!canSwap} style={{ background: canSwap? "#4CAF50" : "#ccc", color: "white", padding: "10px 20px", border: "none", borderRadius: 6, cursor: canSwap? "pointer" : "not-allowed", fontWeight: "bold", fontSize: 14 }}>{getSwapButtonText()}</button>
        {(selectedWorkersA.length > 0 || selectedWorkersB.length > 0) && (<button onClick={() => { setSelectedWorkersA([]); setSelectedWorkersB([]); }} style={{ background: "#ff9800", color: "white", padding: "10px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}>Clear Selection</button>)}
      </div>
      <hr />
      <h3>📦 Group Tree</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {groupKeys.map((g) => {
          const isSwapGroupA = g === swapGroupA;
          const isSwapGroupB = g === swapGroupB;
          const showCheckbox = isSwapGroupA || isSwapGroupB;
          const currentSelected = isSwapGroupA? selectedWorkersA : isSwapGroupB? selectedWorkersB : [];
          const firstWorker = groups[g][0];
          const displayLabel = firstWorker? `${getCategoryLabel(firstWorker.categoryId)}${firstWorker.groupNo}${firstWorker.great}` : g;
          return (
            <div key={g} style={{ border: isSwapGroupA || isSwapGroupB? "2px solid #2196F3" : "1px solid #ccc", margin: 10, padding: 10, minWidth: 220, background: isSwapGroupA? "#e3f2fd" : isSwapGroupB? "#e8f5e9" : "white", borderRadius: 8 }}>
              <b>🔷 {displayLabel}</b>
              <p style={{ margin: "5px 0", fontSize: 13 }}>{groups[g].length} Workers {showCheckbox && (<span style={{ marginLeft: 8, color: "#2196F3" }}>| Selected: {currentSelected.length}</span>)}</p>
              {groups[g].map((w) => (
                <div key={w.id} draggable={!showCheckbox} onDragStart={() =>!showCheckbox && setSelected(w)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (selected &&!showCheckbox) { moveWorker(selected, g); } }}
                  style={{ padding: 6, margin: "4px 0", background: currentSelected.includes(w.id)? "#bbdefb" : "#f3f3f3", cursor: showCheckbox? "pointer" : "grab", borderRadius: 4, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
                  onClick={() => { if (showCheckbox) toggleWorkerSelection(w.id, g); }}>
                  {showCheckbox && (<input type="checkbox" checked={currentSelected.includes(w.id)} onChange={() => toggleWorkerSelection(w.id, g)} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer" }} />)}
                  <span>{w.name} - {w.phone}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
