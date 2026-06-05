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

  // 🔥 FIREBASE WORKERS
  const [workers, setWorkers] = useState([]);

  const [search, setSearch] = useState("");

  useEffect(() => {

    if (!user || user.role !== "admin") return;

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
      const snap = await getDocs(
        collection(db, "workers")
      );

      const allWorkers = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setWorkers(allWorkers);

    } catch (err) {

      console.error(err);

    }

  };

  if (!user || user.role !== "admin") {
    return <p>Admin login required</p>;
  }

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

          {filteredWorkers.length === 0 && (
            <p>No workers found ❌</p>
          )}

          {filteredWorkers.map((w) => (

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

              💚 Status: {w.status} <br />

              {w.approvalDate && (
                <>
                  🕒 Approved:{" "}
                  {new Date(w.approvalDate).toLocaleString()}
                  <br />
                </>
              )}

              {w.contractEnd && (
                <>
                  ⏰ Ends:{" "}
                  {new Date(w.contractEnd).toLocaleString()}
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
                {w.status !== "approved" && (
                  <button
                    onClick={async () => {

                      await updateDoc(
                        doc(db, "workers", w.id),
                        {
                          status: "approved",
                          approved: true,
                        }
                      );

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
                {w.status !== "expired" && (
                  <button
                    onClick={async () => {

                      await updateDoc(
                        doc(db, "workers", w.id),
                        {
                          status: "expired",
                          approved: false,
                        }
                      );

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

                {/* EXTEND */}
                <button
                  onClick={async () => {

                    const end = new Date();

                    end.setMonth(end.getMonth() + 1);

                    await updateDoc(
                      doc(db, "workers", w.id),
                      {
                        status: "approved",
                        approved: true,
                        contractEnd: end.toISOString(),
                      }
                    );

                    alert("Worker Extended ✅");

                    loadAll();

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

                    const ok = window.confirm(
                      "Delete Worker?"
                    );

                    if (!ok) return;

                    await deleteDoc(
                      doc(db, "workers", w.id)
                    );

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

          ))}

        </div>

      )}

      {/* ================= SEARCH LOGS ================= */}

      <hr />

      <h3>📜 Provider Search Logs</h3>

      {searchLogs.length === 0 && (
        <p>No provider searches yet.</p>
      )}

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

          <b>🛠 Category:</b>{" "}
          {getCategoryLabel(l.searchedCategory)} <br />

          <b>⏰ Time:</b>{" "}
          {new Date(l.searchedAt).toLocaleString()}

        </div>

      ))}

      {/* ================= NOTIFICATIONS ================= */}

      <hr />

      <h3>🔔 Admin Notifications</h3>

      {notifications.length === 0 && (
        <p>No notifications</p>
      )}

      {notifications.map((n) => (

        <div
          key={n.id}
          style={{
            border: "1px dashed #999",
            padding: 10,
            marginBottom: 10,
            borderRadius: 6,
            background: n.read ? "#f9f9f9" : "#fffbe6",
          }}
        >

          <b>{n.title}</b>

          <p>{n.message}</p>

          <p>
            ⏰ {new Date(n.createdAt).toLocaleString()}
          </p>

        </div>

      ))}

    </div>

  );

}
