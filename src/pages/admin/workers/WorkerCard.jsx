export default function WorkerCard({ worker, type, onReApprove, onApprove, onEdit, onDelete }) {
  // Daily & Monthly rate calculator
  const getContractInfo = () => {
    if (!worker.contractStart || !worker.contractEnd || !worker.rate) return null;                          
    const start = new Date(worker.contractStart);
    const end = new Date(worker.contractEnd);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyRate = (worker.rate / 30).toFixed(2);      const monthlyRate = (worker.rate).toFixed(2);

    return { start, end, diffDays, dailyRate, monthlyRate };
  };
                                                        const contract = getContractInfo();
                                                        return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",                                  padding: "10px",
        marginBottom: "10px",                                 background: "#fafafa",
        position: "relative",
      }}
    >
      <p><strong>{worker.name}</strong></p>                 <p>📞 {worker.phone}</p>
      <p>Status: {worker.status}</p>

      {/* Contract info */}
      {contract && (
        <div style={{ marginTop: "6px", fontSize: "14px", color: "#333" }}>                                           <p>🗓 Start: {contract.start.toLocaleDateString()}</p>
          <p>🗓 End: {contract.end.toLocaleDateString()}</p>
          <p>💰 Monthly Rate: ₹{contract.monthlyRate}</p>
          <p>💵 Daily Rate: ₹{contract.dailyRate}</p>
          <p>📅 Duration: {contract.diffDays} days</p>
        </div>
      )}

      {/* Pending → Approve */}
      {type === "pending" && (
        <button
          onClick={() => onApprove(worker)}
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "6px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginRight: 6,
          }}
        >
          Approve ⏱️                                           </button>
      )}

      {/* Approved */}
      {type === "approved" && (
        <span style={{ color: "green", fontWeight: "bold" }}>Live 💚</span>
      )}

      {/* Expired → Re-Approve */}
      {type === "expired" && (
        <button                                                 onClick={() => onReApprove(worker.id)}
          style={{                                                marginTop: "8px",
            padding: "8px 12px",                                  borderRadius: "6px",
            backgroundColor: "#FF9800",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginRight: 6,
          }}                                                  >                                                       Re-Approve 🔁                                       </button>
      )}                                              
      {/* Admin buttons */}                                 <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
        <button onClick={() => onEdit(worker)}>✏️ Edit</button>
        <button onClick={() => onDelete(worker.id)}>🗑 Delete</button>
      </div>
    </div>
  );
}
