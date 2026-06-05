import { useState } from "react";
import useWorkers from "./hooks/useWorkers";
import WorkerCalendar from "./WorkerCalendar";

export default function AdminWorkers() {

  const {
    pending,
    approved,
    expired,
    loading,
    approvePendingWorker,
    extendApprovedWorker,
    deleteWorker,
  } = useWorkers();

  const [activeTab, setActiveTab] = useState("pending");

  const [calendarWorker, setCalendarWorker] = useState(null);

  const [isExtend, setIsExtend] = useState(false);

  // 🔥 per worker great
  const [selectedGreat, setSelectedGreat] = useState({});

  if (loading) return <p>Loading workers...</p>;

  const getList = () => {

    if (activeTab === "pending") return pending;

    if (activeTab === "approved") return approved;

    if (activeTab === "expired") return expired;

    return [];

  };

  return (

    <div style={{ padding: 20, maxWidth: 800 }}>

      <h2>👷 Admin Worker Management</h2>

      {/* TABS */}

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

        <Tab
          label={`Pending ♥️ (${pending.length})`}
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        />

        <Tab
          label={`Approved 💚 (${approved.length})`}
          active={activeTab === "approved"}
          onClick={() => setActiveTab("approved")}
        />

        <Tab
          label={`Expired ♠️ (${expired.length})`}
          active={activeTab === "expired"}
          onClick={() => setActiveTab("expired")}
        />

      </div>

      {getList().map((worker) => (

        <div
          key={worker.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >

          <b>👤 {worker.name}</b>
          <br />

          📞 {worker.phone}
          <br />

          📍 {worker.pincode}
          <br />

          🛠 {worker.category}
          <br />

          {/* ===== DETAILS ===== */}

          {worker.great && (
            <>
              ⭐ <b>Great:</b> {worker.great}
              <br />
            </>
          )}

          {worker.approvalDate && (
            <>
              🕒 <b>Approved:</b>{" "}
              {new Date(worker.approvalDate).toLocaleString()}
              <br />
            </>
          )}

          {worker.contractEnd && (
            <>
              ⏰ <b>Ends:</b>{" "}
              {new Date(worker.contractEnd).toLocaleString()}
              <br />
            </>
          )}

          {worker.contractEnd && (
            <>
              📅 <b>Remaining:</b>{" "}

              {(() => {

                const now = new Date();

                const end = new Date(worker.contractEnd);

                const diff = end - now;

                if (diff <= 0) {

                  return "Expired ❌";

                }

                const days = Math.floor(
                  diff / (1000 * 60 * 60 * 24)
                );

                const hours = Math.floor(
                  (diff / (1000 * 60 * 60)) % 24
                );

                const minutes = Math.floor(
                  (diff / (1000 * 60)) % 60
                );

                return `${days} Days ${hours} Hours ${minutes} Minutes`;

              })()}

              <br />
            </>
          )}

          <b>Status:</b>{" "}

          {worker.status === "pending"
            ? "♥️ Pending"
            : worker.status === "approved"
            ? "💚 Approved"
            : "♠️ Expired"}

          {/* ===== GREAT SELECT ===== */}

          {worker.status === "pending" && (

            <div style={{ marginTop: 8 }}>

              <select
                value={selectedGreat[worker.id] || ""}
                onChange={(e) =>
                  setSelectedGreat((prev) => ({
                    ...prev,
                    [worker.id]: e.target.value,
                  }))
                }
              >

                <option value="">Select Great</option>

                <option value="A+">A+</option>

                <option value="A">A</option>

                <option value="B+">B+</option>

                <option value="B">B</option>

                <option value="C+">C+</option>

                <option value="C">C</option>

              </select>

            </div>

          )}

          {/* ===== BUTTONS ===== */}

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 10,
            }}
          >

            {/* APPROVE */}

            {worker.status === "pending" && (

              <button
                onClick={() => {

                  if (!selectedGreat[worker.id]) {

                    alert("Select Great first");

                    return;

                  }

                  setCalendarWorker({
                    ...worker,
                    great: selectedGreat[worker.id],
                  });

                  setIsExtend(false);

                }}
              >
                📅 Approve
              </button>

            )}

            {/* EXTEND */}

            {worker.status === "approved" && (

              <button
                onClick={() => {

                  setCalendarWorker(worker);

                  setIsExtend(true);

                }}
              >
                ⏳ Extend
              </button>

            )}

            {/* RE-APPROVE */}

            {worker.status === "expired" && (

              <button
                onClick={() => {

                  setCalendarWorker(worker);

                  setIsExtend(true);

                }}
              >
                🔄 Re-Approve
              </button>

            )}

            {/* DELETE */}

            <button
              onClick={() => {

                if (window.confirm("Delete this worker?")) {

                  deleteWorker(worker.id);

                }

              }}
              style={{ color: "red" }}
            >
              🗑 Delete
            </button>

          </div>

        </div>

      ))}

      {/* CALENDAR */}

      {calendarWorker && (

        <WorkerCalendar
          worker={calendarWorker}
          approvePendingWorker={approvePendingWorker}
          extendApprovedWorker={extendApprovedWorker}
          isExtend={isExtend}
          onClose={() => setCalendarWorker(null)}
        />

      )}

    </div>

  );

}

function Tab({ label, active, onClick }) {

  return (

    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 8,
        background: active ? "#1f2937" : "#e5e7eb",
        color: active ? "#fff" : "#000",
        border: "none",
      }}
    >
      {label}
    </button>

  );

}
