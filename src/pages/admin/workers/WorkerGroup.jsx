import { useState } from "react";
import useWorkers from "./hooks/useWorkers";
import useWorkerGroups from "./hooks/useWorkerGroups";
import WorkerCard from "./WorkerCard";

export default function WorkerGroup() {
  const { approved, loading: workerLoading } = useWorkers();
  const { groups, addGroup, editGroup, removeGroup, loading: groupLoading } =
    useWorkerGroups();

  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [great, setGreat] = useState("");

  if (workerLoading || groupLoading) return <p>Loading...</p>;

  const toggleWorker = (worker) => {
    setSelectedWorkers((prev) =>
      prev.find((w) => w.id === worker.id)
        ? prev.filter((w) => w.id !== worker.id)
        : [...prev, worker]
    );
  };

  const handleCreateOrEditGroup = async () => {
    if (!groupName) return alert("Enter group name");
    if (selectedWorkers.length === 0)
      return alert("Select at least 1 worker");

    if (!great) return alert("Select Great");

    const sizeMap = {
      "A+": 4, "A": 4,
      "B+": 7, "B": 7,
      "C+": 10, "C": 10
    };

    const maxSize = sizeMap[great];

    if (selectedWorkers.length > maxSize) {
      return alert(`Max ${maxSize} workers allowed for ${great}`);
    }

    const sameCategory = selectedWorkers.every(
      w => w.categoryId === selectedWorkers[0].categoryId
    );

    if (!sameCategory) {
      return alert("All workers must be same category");
    }

    const workerIds = selectedWorkers.map((w) => w.id);
    const categoryId = selectedWorkers[0]?.categoryId;

    try {
      if (editingGroup) {
        await editGroup(editingGroup.id, groupName, workerIds);
        setEditingGroup(null);
      } else {
        await addGroup(groupName, workerIds, categoryId, great);
      }

      setGroupName("");
      setSelectedWorkers([]);
      setGreat("");

      alert("Group saved successfully ✅");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setGroupName(group.groupName);
    setSelectedWorkers(group.workers);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h2>👷 Worker Groups</h2>

      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      {/* GREAT SELECT */}
      <select value={great} onChange={(e) => setGreat(e.target.value)}>
        <option value="">Select Great</option>
        <option value="A+">A+</option>
        <option value="A">A</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="C+">C+</option>
        <option value="C">C</option>
      </select>

      <button onClick={handleCreateOrEditGroup}>
        {editingGroup ? "Save Changes" : "Create Group"}
      </button>

      <h3>Approved Workers</h3>

      {approved.map((worker) => (
        <div
          key={worker.id}
          onClick={() => toggleWorker(worker)}
          style={{
            border: selectedWorkers.find((w) => w.id === worker.id)
              ? "2px solid green"
              : "1px solid gray",
            margin: "5px",
            padding: "5px",
          }}
        >
          <WorkerCard worker={worker} type="approved" />
        </div>
      ))}

      <h3>Groups</h3>

      {groups.map((g) => (
        <div key={g.id}>
          <b>{g.groupName}</b> ({g.great}) — {g.workers.length}

          <button onClick={() => handleEditClick(g)}>Edit</button>
          <button onClick={() => removeGroup(g.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
