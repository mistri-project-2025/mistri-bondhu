import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState("worker"); // worker | admin
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleWorkerLogin = async () => {
    if(!/^[6-9]\d{9}$/.test(phone)) return alert("❌ সঠিক Phone দাও");
    try{
      // 1. workers collection এ খোঁজো (approved)
      let q = query(collection(db, "workers"), where("phone","==",phone));
      let snap = await getDocs(q);
      if(!snap.empty){
        const data = snap.docs[0].data();
        login({...data, status:"approved"});
        navigate("/worker/dashboard");
        return;
      }
      // 2. pendingWorkers এ খোঁজো
      q = query(collection(db, "pendingWorkers"), where("phone","==",phone));
      snap = await getDocs(q);
      if(!snap.empty){
        const data = snap.docs[0].data();
        login({...data, status:"pending"});
        navigate("/worker/dashboard");
        return;
      }
      alert("❌ এই Phone দিয়ে Worker পাওয়া যায়নি। Signup করো।");
    }catch(e){ alert(e.message); }
  };

  const handleAdminLogin = async () => {
    if (!email ||!password) return alert("Enter email & password");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = userCredential.user;
      let role = "user";
      const adminSnap = await getDoc(doc(db, "admins", user.uid));
      if (adminSnap.exists()) role = "admin";
      login({ uid: user.uid, email: user.email, role });
      if (role === "admin") navigate("/admin");
      else navigate("/role");
    } catch (err) {
      alert("ERROR: " + err.code);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth:400, margin:"auto" }}>
      <h2>Login</h2>
      <div style={{display:"flex", gap:10, marginBottom:20}}>
        <button onClick={()=>setMode("worker")} style={{padding:10, background: mode==="worker"?"#1976D2":"#eee", color: mode==="worker"?"#fff":"#000"}}>👷 Worker</button>
        <button onClick={()=>setMode("admin")} style={{padding:10, background: mode==="admin"?"#1976D2":"#eee", color: mode==="admin"?"#fff":"#000"}}>🔑 Admin</button>
      </div>

      {mode==="worker"? (
        <div>
          <input type="tel" placeholder="Phone Number - 9876543210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} style={{width:"100%", padding:14, fontSize:16}} />
          <br/><br/>
          <button onClick={handleWorkerLogin} style={{width:"100%", padding:14, background:"green", color:"#fff", fontSize:16}}>👷 Worker Dashboard এ ঢুকো</button>
        </div>
      ) : (
        <div>
          <input type="email" placeholder="Enter Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%", padding:12}} />
          <br/><br/>
          <input type="password" placeholder="Enter Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%", padding:12}} />
          <br/><br/>
          <button onClick={handleAdminLogin}>Login</button>
        </div>
      )}
    </div>
  );
}
