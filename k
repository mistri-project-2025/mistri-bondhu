k          borderRadius: 10,
          marginBottom: 20,
          background: "#fafafa",
        }}
      >
        <h3>🔎 Search Workers</h3>
        <input
          type="text"
          placeholder="Search Name / Phone / Pincode / Address / Business Name / Category"
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

      {filteredWorkers.length === 0 && <p>No workers found ❌</p>}

      {filteredWorkers.map((worker) => {
        const displayGroupLabel =
          worker.groupNo && worker.great
            ? `${getCategoryLabel(worker.categoryId)}${worker.groupNo}${worker.great}`
            : worker.groupLabel || "No Group";

        return (
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
            🏠 Address: {worker.address || "N/A"}
            <br />
            🏢 Business: {worker.companyName || "N/A"}
            <br />
            🛠 {worker.category}
            <br />
            <p>Group: {displayGroupLabel}</p>
            <p>No: {worker.groupNo}</p>

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
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                  const minutes = Math.floor((diff / (1000 * 60)) % 60);
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

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setEditModal({ open: true, worker: worker })}
                style={{
                  background: "#2196F3",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                }}
              >
                ✏️ Edit
              </button>

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

              {worker.status === "approved" && (
                <button
                  onClick={() => {
                    setCalendarWorker({
                      ...worker,
                      selectedGreat: worker.great || "A+",
                    });
                    setIsExtend(true);
                  }}
                >
                  ⏳ Extend
                </button>
              )}

              {worker.status === "expired" && (
                <button
                  onClick={() => {
                    setCalendarWorker({
                      ...worker,
                      selectedGreat: worker.great || "A+",
                    });
                    setIsExtend(true);
                  }}
                >
                  🔄 Re-Approve
                </button>
              )}

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
        );
      })}

      {calendarWorker && (
        <WorkerCalendar
          worker={calendarWorker}
          approvePendingWorker={approvePendingWorker}
          extendApprovedWorker={extendApprovedWorker}
          isExtend={isExtend}
          onClose={() => setCalendarWorker(null)}
        />
      )}

      {editModal.open && (
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
              minWidth: 350,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>✏️ Edit Worker</h3>
            <p>
              <b>{editModal.worker?.name}</b>
            </p>

            <label>Name:</label>
            <input
              type="text"
              defaultValue={editModal.worker?.name}
              id="edit-name"
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Phone:</label>
            <input
              type="text"
              defaultValue={editModal.worker?.phone}
              id="edit-phone"
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Pincode:</label>
            <input
              type="text"
              defaultValue={editModal.worker?.pincode}
              id="edit-pincode"
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Address:</label>
            <input
              type="text"
              defaultValue={editModal.worker?.address}
              id="edit-address"
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Business Name:</label>
            <input
              type="text"
              defaultValue={editModal.worker?.companyName}
              id="edit-companyName"
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label>Great:</label>
            <select
              defaultValue={editModal.worker?.great}
              id="edit-great"
              style={{ width: "100%", padding: 8, marginBottom: 15 }}
            >
              <option>A+</option>
              <option>A</option>
              <option>B+</option>
              <option>B</option>
              <option>C+</option>
              <option>C</option>
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  const updatedData = {
                    name: document.getElementById("edit-name").value,
                    phone: document.getElementById("edit-phone").value,
                    pincode: document.getElementById("edit-pincode").value,
                    address: document.getElementById("edit-address").value,
                    companyName: document.getElementById("edit-companyName").value,
                    great: document.getElementById("edit-great").value,
                  };
                  handleUpdateWorker(updatedData);
                }}
                style={{
                  flex: 1,
                  background: "#4CAF50",
                  color: "#fff",
                  padding: 10,
                  border: "none",
                  borderRadius: 6,
                }}
              >
                ✅ Save
              </button>
              <button
                onClick={() => setEditModal({ open: false, worker: null })}
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
