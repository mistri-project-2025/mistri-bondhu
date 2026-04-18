import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES, getCategoryLabel } from "../../utils/categories";
import { providerSearchWorkers } from "../../firebase/search";

export default function ProviderSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/role");
  }, [user, navigate]);

  const handleSearch = async () => {
    if (!selectedCategory) return;

    const finalCategory = selectedCategory === "other" ? customCategory : selectedCategory;

    if (!finalCategory) return alert("Please enter category");

    setLoading(true);
    try {
      const workers = await providerSearchWorkers(user, finalCategory);
      setResults(workers);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Redirecting...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Search Workers</h2>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ padding: 8, width: "100%", borderRadius: 6, marginBottom: 10 }}
      >
        <option value="">Select category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.bn}
          </option>
        ))}
        <option value="other">Other</option>
      </select>

      {selectedCategory === "other" && (
        <input
          type="text"
          placeholder="Enter custom category"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6, marginBottom: 10 }}
        />
      )}

      <button
        onClick={handleSearch}
        style={{
          padding: 12,
          width: "100%",
          borderRadius: 8,
          background: "#4A90E2",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      <hr style={{ margin: "20px 0" }} />

      {results.length > 0 ? (
        results.map((w) => (
          <div
            key={w.id}
            style={{
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p>
              <strong>{w.name}</strong> — {getCategoryLabel(w.categoryId)}
            </p>
            <p>📞 {w.phone}</p>
          </div>
        ))
      ) : loading ? null : (
        <p style={{ textAlign: "center", color: "#888" }}>No workers found</p>
      )}
    </div>
  );
}
