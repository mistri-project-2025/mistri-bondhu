import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../../utils/categories";
import { useAuth } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import {
  pendingWorkersCollection,
  providersCollection,
  auth,
} from "../../firebase/config";
import { signInAnonymously, signOut } from "firebase/auth";
import { lockPhoneNumber } from "../../firebase/workers";

export default function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    phone: "",
    name: "",
    address: "",
    pincode: "",
    experience: "",
    categoryId: "",   // ✅ system id
    category: "",     // ✅ display name
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ FIXED — এখন পুরো object পাঠাবো
  const handleCategorySelect = (categoryObj) => {
    setForm({
      ...form,
      categoryId: categoryObj.id,   // 🔥 contractor_mason
      category: categoryObj.en,     // 🔥 Contractor - Mason 🧱
    });

    setCategorySearch(categoryObj.en);
    setShowCategoryList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone) return alert("Phone required");
    if (!form.categoryId) return alert("Category required");

    if (role === "worker") {
      if (!form.name || !form.address || !form.pincode) {
        return alert("Fill all worker fields");
      }
    }

    try {
      if (auth.currentUser) await signOut(auth);

      const res = await signInAnonymously(auth);
      const user = res.user;

      await lockPhoneNumber({
        phone: form.phone,
        uid: user.uid,
        role,
      });

      const payload = {
        uid: user.uid,
        role,
        phone: form.phone,

        // ✅ VERY IMPORTANT
        categoryId: form.categoryId,
        category: form.category,

        name:
          role === "worker"
            ? form.name
            : `Provider_${form.phone}`,

        address:
          role === "worker"
            ? form.address
            : "Auto Address",

        pincode:
          role === "worker"
            ? form.pincode
            : "700001",

        experience:
          role === "worker"
            ? form.experience
            : "",

        status:
          role === "worker"
            ? "pending"
            : "active",

        createdAt: new Date().toISOString(),
      };

      if (role === "worker") {
        await setDoc(
          doc(pendingWorkersCollection, user.uid),
          payload
        );

        login(payload);
        navigate("/worker/dashboard");
      } else {
        await setDoc(
          doc(providersCollection, user.uid),
          payload
        );

        login(payload);
        navigate("/provider/search");
      }
    } catch (err) {
      alert(err?.message || JSON.stringify(err));
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ fontSize: 28, marginBottom: 20 }}>
        {role === "worker"
          ? "Worker Signup"
          : "Provider Signup"}
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Category Select */}
        <div style={{ position: "relative" }}>
          <input
            placeholder="Category"
            value={categorySearch}
            onChange={(e) => {
              setCategorySearch(e.target.value);
              setShowCategoryList(true);
            }}
            required
          />

          {showCategoryList && (
            <div
              style={{
                position: "absolute",
                background: "#fff",
                border: "1px solid #ccc",
                zIndex: 10,
              }}
            >
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  onClick={() =>
                    handleCategorySelect(c)  // 🔥 object পাঠাচ্ছি
                  }
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  {c.en}
                </div>
              ))}
            </div>
          )}
        </div>

        {role === "worker" && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <input
              name="pincode"
              placeholder="Pincode"
              value={form.pincode}
              onChange={handleChange}
              required
            />
            <input
              name="experience"
              placeholder="Experience"
              value={form.experience}
              onChange={handleChange}
            />
          </>
        )}

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <button type="submit">
          💾 Save
        </button>
      </form>
    </div>
  );
}
