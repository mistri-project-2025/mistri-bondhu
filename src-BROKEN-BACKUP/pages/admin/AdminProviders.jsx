import { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { sendLeadAuto, sendLeadManual, getRotationStatus } from "../../utils/leadRotation";

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [leadsHistory, setLeadsHistory] = useState([]);
  const [autoOn, setAutoOn] = useState(false);
  const [hasNewProvider, setHasNewProvider] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevCountRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [rotationInfo, setRotationInfo] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showProviders, setShowProviders] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadAuto = async () => {
      const snap = await getDoc(doc(db, "settings", "autoLead"));
      if(snap.exists()) setAutoOn(snap.data().enabled || false);
    };
    loadAuto();
    // Enable audio on first click anywhere
    const enableAudio = () => {
      if(!soundEnabled){
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume();
      }
    };
    document.addEventListener("click", enableAudio, { once: true });
  }, []);

  const toggleAuto = async () => {
    const newVal =!autoOn;
    setAutoOn(newVal);
    await setDoc(doc(db, "settings", "autoLead"), { enabled: newVal, updatedAt: new Date().toISOString() });
    alert(newVal? "✅ Auto ON - Provider Search করলেই নিজে থেকে Lead যাবে" : "❌ Auto OFF - এখন Button চেপে পাঠাতে হবে");
  };

  const playSound = async () => {
    if(!soundEnabled) return;
    try {
      // Loud Beep + Bell
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if(ctx.state === 'suspended') await ctx.resume();
      
      for(let i=0; i<3; i++){
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 1000;
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(1, ctx.currentTime + i*0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i*0.3 + 0.2);
        osc.start(ctx.currentTime + i*0.3);
        osc.stop(ctx.currentTime + i*0.3 + 0.2);
      }
      
      // MP3 also try
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3");
      audio.volume = 1.0;
      audio.play().catch(()=>{});

      if(navigator.vibrate) navigator.vibrate([500,200,500,200,800]);
      
      if(Notification.permission === "granted"){
        new Notification("🔔 New Provider Search!", { body: "নতুন Provider Search এসেছে!" });
      }
    } catch(e){ console.log("Sound error", e); }
  };

  const fetchAll = async () => {
    const pSnap = await getDocs(collection(db, "providers"));
    const list = pSnap.docs.map(d => ({ id: d.id,...d.data() })).sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if(list.length > prevCountRef.current && prevCountRef.current!== 0){
      setHasNewProvider(true);
      playSound();

      const newOnes = list.slice(0, list.length - prevCountRef.current);
      setNotifications(prev => [...newOnes.map(p => ({...p, time: new Date().toLocaleString()})),...prev]);
      setTimeout(() => setHasNewProvider(false), 8000);

      if(autoOn){
        for(const prov of newOnes){
          const providerData = {...prov, providerId: prov.id, searchedCategory: prov.categoryId || prov.category };
          const result = await sendLeadAuto(providerData);
          if(result.success){
            await deleteDoc(doc(db, "providers", prov.id));
          }
        }
        setTimeout(fetchAll, 1500);
      }
    }
    prevCountRef.current = list.length;
    setProviders(list);

    const lSnap = await getDocs(collection(db, "leads"));
    setLeadsHistory(lSnap.docs.map(d => d.data()).sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt)));
  };

  useEffect(() => {
    fetchAll();
    if(Notification && Notification.permission!== "granted") Notification.requestPermission();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [autoOn, soundEnabled]);

  useEffect(() => {
    const fetchRotation = async () => {
      const status = await getRotationStatus("civil_contractor");
      setRotationInfo(status);
      if(status?.all?.length) setSelectedGroup(`${status.all[0].groupNo}|${status.all[0].great}`);
    };
    fetchRotation();
  }, []);

  const handleManualSend = async (provider, type) => {
    setLoading(true);
    let result;
    const providerData = {...provider, providerId: provider.id, searchedCategory: provider.categoryId || provider.category };
    if(type === 'auto') result = await sendLeadAuto(providerData);
    else if(type === 'selected'){ const [gNo, great] = selectedGroup.split("|"); result = await sendLeadManual(providerData, gNo, great); }
    else { const groupNo = prompt("Group No?"); const great = prompt("Great?"); result = await sendLeadManual(providerData, groupNo, great); }
    alert(result.message);
    if(result.success){ await deleteDoc(doc(db, "providers", provider.id)); fetchAll(); }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ background: hasNewProvider? "#ffebee" : "#fff", border: hasNewProvider? "2px solid red" : "1px solid #ddd", padding: 15, borderRadius: 12, marginBottom: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28, animation: hasNewProvider? "shake 0.5s infinite" : "none", position: "relative" }}>
              🔔
              {providers.length > 0 && <span style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 10 }}>{providers.length}</span>}
            </span>
            Provider Search Notifications
            {hasNewProvider && <span style={{ background: "red", color: "white", padding: "2px 8px", borderRadius: 12, fontSize: 12, animation: "blink 1s infinite" }}>NEW!</span>}
          </h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {!soundEnabled ? (
              <button onClick={() => { setSoundEnabled(true); const ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); playSound(); alert("✅ Sound ON - এবার Bell বাজবে"); }} style={{ background: "#f44336", color: "white", padding: "8px 15px", borderRadius: 20, border: "none", fontWeight: "bold", animation: "blink 1s infinite", cursor: "pointer" }}>
                🔊 Enable Sound
              </button>
            ) : <span style={{ background: "#e8f5e9", color: "green", padding: "6px 12px", borderRadius: 20, fontSize: 13, border: "1px solid green" }}>🔊 Sound ON</span>}

            <label style={{ display: "flex", alignItems: "center", gap: 8, background: autoOn? "#e8f5e9" : "#f5f5f5", padding: "8px 15px", borderRadius: 20, border: autoOn? "2px solid #4caf50" : "2px solid #999", cursor: "pointer" }}>
              <input type="checkbox" checked={autoOn} onChange={toggleAuto} style={{ width: 20, height: 20 }} />
              <span style={{ fontWeight: "bold", color: autoOn? "#2e7d32" : "#666" }}>{autoOn? "🟢 Auto ON" : "⚪ Auto OFF"}</span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button onClick={() => setNotifications([])} style={{ fontSize: 12 }}>✅ Mark all as read</button>
          <button onClick={() => setNotifications([])} style={{ fontSize: 12 }}>❌ Clear all</button>
          <button onClick={playSound} style={{ fontSize: 12 }}>🔊 Test Sound</button>
        </div>

        {notifications.length === 0? <p style={{ marginTop: 10 }}>No provider search notifications</p> : (
          <div style={{ marginTop: 10 }}>
            {notifications.map((n,i) => (
              <div key={i} style={{ background: "#e3f2fd", padding: 8, marginBottom: 5, borderRadius: 6, fontSize: 13 }}>
                🆕 <b>{n.id}</b> - {n.categoryId} - 📍 {n.address?.slice(0,60)} - ⏰ {n.time}
              </div>
            ))}
          </div>
        )}
      </div>

      <h2>Providers Dashboard - Pending: {providers.length} | History: {leadsHistory.length}</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setShowProviders(!showProviders)}>{showProviders? "❌ Close Providers" : `📋 Providers (${providers.length})`}</button>
        <button onClick={() => setShowHistory(!showHistory)} style={{ background: "#673ab7", color: "white" }}>{showHistory? "❌ Close History" : `📜 Leads History (${leadsHistory.length})`}</button>
        <span style={{ padding: "8px", background: autoOn? "#4caf50" : "#999", color: "white", borderRadius: 6, fontSize: 12 }}>{autoOn? "🤖 Auto Sending Enabled" : "✋ Manual Mode"}</span>
      </div>

      {showProviders && providers.map((p) => (
        <div key={p.id} style={{ border: "2px solid #2196f3", padding: 12, marginBottom: 12, borderRadius: 8, background: "#fff" }}>
          <b>{p.id} - {p.phone || p.providerPhone} - {p.categoryId || p.category}</b>
          <div style={{ fontSize: 12 }}>📍 {p.address || p.providerAddress || "Auto Address - 700001"}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button disabled={loading} onClick={() => handleManualSend(p, 'auto')} style={{ background: "#2196f3", color: "white", padding: "8px 12px", border: "none", borderRadius: 4 }}>📤 Auto ({rotationInfo?.current?.groupNo}{rotationInfo?.current?.great || "1B+"})</button>
            <button disabled={loading} onClick={() => handleManualSend(p, 'selected')} style={{ background: "#ff9800", color: "white", padding: "8px 12px", border: "none", borderRadius: 4 }}>🎯 Selected {selectedGroup.replace("|","")}</button>
            <button disabled={loading} onClick={() => handleManualSend(p, 'manual')} style={{ background: "#4caf50", color: "white", padding: "8px 12px", border: "none", borderRadius: 4 }}>✏️ Manual</button>
          </div>
        </div>
      ))}

      <style>{`@keyframes shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-15deg)} 75%{transform:rotate(15deg)} } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
