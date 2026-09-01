// src/pages/workers/WorkerProfile.jsx
import { useEffect, useState } from "react";
import { CATEGORIES } from "../../utils/categories";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function WorkerProfile({ uid, onClose }) {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    experience: "",
    categoryId: "",
  });

  const [customCategory, setCustomCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED LOAD LOGIC
  useEffect(() => {
    if (!uid) return;

    const loadProfile = async () => {
      try {
        let ref = doc(db, "workers", uid);
        let snap = await getDoc(ref);

        // যদি workers এ না থাকে → pending এ check
        if (!snap.exists()) {
          ref = doc(db, "pendingWorkers", uid);
          snap = await getDoc(ref);
        }

        if (snap.exists()) {
          const data = snap.data();

          setForm({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            pincode: data.pincode || "",
            experience: data.experience || "",
            categoryId: data.categoryId || "",
          });

          setCustomCategory(data.customCategory || data.category || "");
          setCategorySearch(data.customCategory || data.category || "");

          // ✅ IMPORTANT — user context update
          if (user) {
            login({ ...user, ...data });
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [uid]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCategorySelect = (cat) => {
    setForm({ ...form, categoryId: cat });
    setCustomCategory(cat);
    setCategorySearch(cat);
    setShowCategoryList(false);
  };

  // ✅ FIXED SAVE LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let ref = doc(db, "workers", uid);
      let snap = await getDoc(ref);

      // যদি workers এ না থাকে → pending এ save
      if (!snap.exists()) {
        ref = doc(db, "pendingWorkers", uid);
      }

      await setDoc(
        ref,
        { ...form, customCategory },
        { merge: true }
      );

      const updatedUser = {
        ...user,
        ...form,
        category: customCategory,
      };

      login(updatedUser);

      alert("✅ Profile updated");
      onClose();

    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#fff",
      padding: 16,
      overflowY: "auto",
      zIndex: 1000,
    }}>
      <h3 style={{ marginBottom: 20 }}>Edit Profile</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" required />
        <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience" />

        {/* Category */}
        <div style={{ position: "relative" }}>
          <input
            placeholder="Category"
            value={categorySearch || customCategory}
            onChange={(e) => {
              setCategorySearch(e.target.value);
              setCustomCategory(e.target.value);
              setForm({ ...form, categoryId: "" });
              setShowCategoryList(true);
            }}
            onFocus={() => setShowCategoryList(true)}
            required
          />

          {showCategoryList && (
            <div style={{
              border: "1px solid #ccc",
              maxHeight: 200,
              overflowY: "auto",
              background: "#fff",
              position: "absolute",
              width: "100%",
              zIndex: 10,
            }}>
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  style={{ padding: 10, cursor: "pointer" }}
                  onClick={() => handleCategorySelect(c.en)}
                >
                  {c.en}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit">💾 Save</button>
        <button type="button" onClick={onClose}>Close</button>

      </form>
    </div>
  );
}
