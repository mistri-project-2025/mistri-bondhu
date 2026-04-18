// src/pages/admin/workers/WorkerForm.jsx
import { useEffect, useState } from "react";
import { CATEGORIES } from "../../../utils/categories"; // ✅ fixed path

export default function WorkerForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    address: "",
    pincode: "",
    experience: "",
    categoryId: "",
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);

  // 🔁 Edit mode → autofill
  useEffect(() => {
    if (initialData) {
      setForm({
        phone: initialData.phone || "",
        name: initialData.name || "",
        address: initialData.address || "",
        pincode: initialData.pincode || "",
        experience: initialData.experience || "",
        categoryId: initialData.category || "",
      });
      setCategorySearch(initialData.category || "");
      setCustomCategory(initialData.category || "");
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (value) => {
    setCustomCategory(value);
    setCategorySearch(value);
    setForm({ ...form, categoryId: value });
    setShowCategoryList(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      category: form.categoryId || customCategory,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        required
        style={{ fontSize: 18, padding: "10px 12px" }}
      />
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
        style={{ fontSize: 18, padding: "10px 12px" }}
      />
      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        required
        style={{ fontSize: 18, padding: "10px 12px" }}
      />
      <input
        name="pincode"
        placeholder="Pincode"
        value={form.pincode}
        onChange={handleChange}
        required
        style={{ fontSize: 18, padding: "10px 12px" }}
      />
      <input
        name="experience"
        placeholder="Experience"
        value={form.experience}
        onChange={handleChange}
        style={{ fontSize: 18, padding: "10px 12px" }}
      />

      {/* Category Input */}
      <div style={{ marginTop: 10, position: "relative" }}>
        <div style={{ display: "flex" }}>
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
            style={{ flex: 1, fontSize: 18, padding: "10px 12px" }}
          />
          <button
            type="button"
            onClick={() => setShowCategoryList((p) => !p)}
            style={{ marginLeft: 6, padding: "0 12px", fontSize: 18 }}
          >
            {showCategoryList ? "˄" : "˅"}
          </button>
        </div>

        {showCategoryList && (
          <div
            style={{
              border: "1px solid #ccc",
              marginTop: 6,
              maxHeight: 220,
              overflowY: "auto",
              background: "#fff",
              position: "absolute",
              width: "100%",
              zIndex: 10,
            }}
          >
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                style={{ padding: 10, cursor: "pointer", fontSize: 18 }}
                onClick={() => handleCategorySelect(c.en)}
              >
                {c.en}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button type="submit" style={{ flex: 1, padding: 12 }}>
          {initialData ? "Update Worker" : "Add Worker"}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: 12 }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
