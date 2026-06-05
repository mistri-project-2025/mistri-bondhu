import { useMemo } from "react";

const GRADE_ORDER = ["A+", "A", "B+", "B", "C+", "C"];

export default function RotationStatusPanel({ workers = [] }) {
  const stats = useMemo(() => {
    const categories = {};

    workers.forEach((w) => {
      const cat = w.categoryId || "unknown";

      if (!categories[cat]) {
        categories[cat] = {
          total: 0,
          grades: {
            "A+": 0,
            "A": 0,
            "B+": 0,
            "B": 0,
            "C+": 0,
            "C": 0,
            NA: 0,
          },
        };
      }

      categories[cat].total++;

      const grade = w.great || "NA";

      if (categories[cat].grades[grade] !== undefined) {
        categories[cat].grades[grade]++;
      } else {
        categories[cat].grades.NA++;
      }
    });

    return categories;
  }, [workers]);

  return (
    <div
      style={{
        marginTop: 30,
        padding: 15,
        border: "2px solid #1976D2",
        borderRadius: 10,
        background: "#fff",
      }}
    >
      <h2>📊 Rotation Status</h2>

      {Object.keys(stats).length === 0 && (
        <p>No worker data found</p>
      )}

      {Object.entries(stats).map(([category, data]) => (
        <div
          key={category}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <h3>🛠 {category}</h3>

          <p>
            <b>Total Workers:</b> {data.total}
          </p>

          {GRADE_ORDER.map((grade) => (
            <div key={grade}>
              ⭐ {grade} = {data.grades[grade]}
            </div>
          ))}

          {data.grades.NA > 0 && (
            <div>
              ⚠️ No Grade = {data.grades.NA}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
