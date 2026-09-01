import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCategoryLabel } from "../../utils/categories";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminSearch() {
  const { user } = useAuth();
  const [searchLogs, setSearchLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");

  // 🆕 EXTEND MODAL STATE
  const [extendModal, setExtendModal] = useState({
    open: false,
    worker: null,
    newGreat: "",
    newMonths: 1,
  });

  useEffect(() => {
    if (!user || user.role!== "admin") return;
    loadAll();
  }, [user]);

  // =========================
  // 🔥 LOAD DATA
  // =========================
  const loadAll = async () => {
    try {
      // ✅ Provider logs
      const logs = JSON.parse(
        localStorage.getItem("mb_provider_search_logs") || "[]"
      );
      setSearchLogs(logs);

      // ✅ Notifications
      const noti = JSON.parse(
        localStorage.getItem("mb_admin_notifications") || "[]"
      );
      setNotifications(noti);

      // ✅ FIREBASE WORKERS
      const snap = await getDocs(collection(db, "workers"));
      const allWorkers = snap.docs.map((d) => ({
        id: d.id,
       ...d.data(),
      }));
      setWorkers(allWorkers);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role!== "admin") {
    return <p>Admin login required</p>;
  }

  // =========================
  // 🆕 CALCULATE END DATE HELPER
  // =========================
  const getContractEndDate = (approvedDate, great) => {
    if (!approvedDate) return null;
    const durationMonths = ["A+", "B+", "C+"].includes(great)? 12 : 1; // 👈 A+/B+/C+ = 12 মাস, A/B/C = 1 মাস
    const endDate = new Date(approvedDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    return endDate;
  };

  // =========================
  // 🆕 EXTEND WORKER HANDLER
  // =========================
  const handleExtendWorker = async () => {
    const { worker, newGreat, newMonths } = extendModal;
    if (!worker) return;

    const approvedDate = worker.approvalDate || new Date().toISOString();
    const endDate = new Date(approvedDate);
    endDate.setMonth(endDate.getMonth() + newMonths);

    try {
      await updateDoc(doc(db, "workers", worker.id), {
        status: "approved",
        approved: true,
        great: newGreat || worker.great, // 👈 Great update হবে
        approvalDate: approvedDate,
        contractEnd: endDate.toISOString(),
        updatedAt: new Date().toISOString(),
      });
      alert("✅ Worker Extended Successfully!");
      setExtendModal({ open: false, worker: null, newGreat: "", newMonths: 1 });
      loadAll();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // =========================
  // 🔥 SEARCH FILTER
  // =========================
  const filteredWorkers = workers.filter((w) => {
    const text = search.toLowerCase();
    return (
      w.name?.toLowerCase().includes(text) ||
      w.phone?.includes(text) ||
      w.pincode?.includes(text) ||
      w.category?.toLowerCase().includes(text) ||
      w.companyName?.toLowerCase().includes(text)
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>🔍 Admin Search Monitor</h2>
      {/* ================= SEARCH BOX ================= */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
          background: "#fafafa",
        }}
      >
        <h3>🔎 Search Workers</h3>
        <input
          type="text"
          placeholder="Search Name / Phone / Pincode / Category / Company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* ================= RESULTS ================= */}
      {search && (
        <div style={{ marginBottom: 30 }}>
          <h3>👷 Search Results</h3>
          {filteredWorkers.length === 0 && <p>No workers found ❌</p>}
          {filteredWorkers.map((w) => {
            // 🆕 Calculate correct End Date
            const calculatedEndDate = getContractEndDate(w.approvalDate, w.great);
            // 🆕 Group Label Format: Civilcontractor1A+
            const displayGroupLabel = w.groupNo && w.great
             ? `${getCategoryLabel(w.categoryId)}${w.groupNo}${w.great}`
              : w.groupLabel || "No Group";

            return (
              <div
                key={w.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 8,
                  background: "#fff",
                }}
              >
                <b>👤 {w.name}</b> <br />
                📞 {w.phone} <br />
                📍 {w.pincode} <br />
                🛠 {w.category} <br />
                ⭐ Great: {w.great || "N/A"} <br />
                🏷️ Group: {displayGroupLabel} {/* 👈 2. Group Label যোগ করলাম */}
                <br />
                💚 Status: {w.status} <br />
                {w.approvalDate && (
                  <>
                    🕒 Approved: {new Date(w.approvalDate).toLocaleString()}
                    <br />
                  </>
                )}
                {/* 👇 1. 12/1 মাসের End Time */}
                {w.approvalDate && (
                  <>
                    ⏰ Ends: {calculatedEndDate? calculatedEndDate.toLocaleString() : "N/A"}
                    <br />
                  </>
                )}

                {/* ================= ACTION BUTTONS ================= */}
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {/* APPROVE */}
                  {w.status!== "approved" && (
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, "workers", w.id), {
                          status: "approved",
                          approved: true,
                        });
                        alert("Worker Approved ✅");
                        loadAll();
                      }}
                      style={{
                        background: "green",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                      }}
                    >
                      💚 Approve
                    </button>
                  )}

                  {/* EXPIRE */}
                  {w.status!== "expired" && (
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, "workers", w.id), {
                          status: "expired",
                          approved: false,
                        });
                        alert("Worker Expired ❌");
                        loadAll();
                      }}
                      style={{
                        background: "orange",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                      }}
                    >
                      ♠️ Expire
                    </button>
                  )}

                  {/* EXTEND - 🆕 MODAL OPEN */}
                  <button
                    onClick={() => {
                      setExtendModal({
                        open: true,
                        worker: w,
                        newGreat: w.great || "A",
                        newMonths: ["A+", "B+", "C+"].includes(w.great)? 12 : 1,
                      });
                    }}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                    }}
                  >
                    ⏳ Extend
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={async () => {
                      const ok = window.confirm("Delete Worker?");
                      if (!ok) return;
                      await deleteDoc(doc(db, "workers", w.id));
                      alert("Worker Deleted 🗑");
                      loadAll();
                    }}
                    style={{
                      background: "red",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 🆕 EXTEND MODAL ================= */}
      {extendModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              minWidth: 300,
            }}
          >
            <h3>⏳ Extend Worker</h3>
            <p>
              <b>{extendModal.worker?.name}</b>
            </p>

            <label>Select New Great:</label>
            <select
              value={extendModal.newGreat}
              onChange={(e) =>
                setExtendModal({...extendModal, newGreat: e.target.value })
              }
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            >
              <option>A+</option>
              <option>A</option>
              <option>B+</option>
              <option>B</option>
              <option>C+</option>
              <option>C</option>
            </select>

            <label>Extend Duration:</label>
            <select
              value={extendModal.newMonths}
              onChange={(e) =>
                setExtendModal({
                 ...extendModal,
                  newMonths: Number(e.target.value),
                })
              }
              style={{ width: "100%", padding: 8, marginBottom: 15 }}
            >
              <option value={1}>1 Month - A/B/C</option>
              <option value={12}>12 Months - A+/B+/C+</option>
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleExtendWorker}
                style={{
                  flex: 1,
                  background: "#4CAF50",
                  color: "#fff",
                  padding: 10,
                  border: "none",
                  borderRadius: 6,
                }}
              >
                ✅ Confirm
              </button>
              <button
                onClick={() =>
                  setExtendModal({
                    open: false,
                    worker: null,
                    newGreat: "",
                    newMonths: 1,
                  })
                }
                style={{
                  flex: 1,
                  background: "#999",
                  color: "#fff",
                  padding: 10,
                  border: "none",
                  borderRadius: 6,
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SEARCH LOGS ================= */}
      <hr />
      <h3>📜 Provider Search Logs</h3>
      {searchLogs.length === 0 && <p>No provider searches yet.</p>}
      {searchLogs.map((l) => (
        <div
          key={l.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            background: "#fafafa",
          }}
        >
          <b>🧑‍💼 Provider:</b> {l.providerName} <br />
          <b>📞 Phone:</b> {l.providerPhone} <br />
          <b>📍 PIN:</b> {l.providerPincode} <br />
          <b>🛠 Category:</b> {getCategoryLabel(l.searchedCategory)} <br />
          <b>⏰ Time:</b> {new Date(l.searchedAt).toLocaleString()}
        </div>
      ))}

      {/* ================= NOTIFICATIONS ================= */}
      <hr />
      <h3>🔔 Admin Notifications</h3>
      {notifications.length === 0 && <p>No notifications</p>}
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            border: "1px dashed #999",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            background: n.read? "#f9f9f9" : "#fffbe6",
          }}
        >
          <b>{n.title}</b>
          <p>{n.message}</p>
          <p>⏰ {new Date(n.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
