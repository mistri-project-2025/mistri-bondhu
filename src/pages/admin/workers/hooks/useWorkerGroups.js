import { useState, useEffect } from "react";
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../services/workerGroupService";

export default function useWorkerGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // load all groups
  const loadGroups = async () => {
    setLoading(true);
    const data = await getAllGroups();
    setGroups(data);
    setLoading(false);
  };

  // add new group
  const addGroup = async (groupName, workerIds) => {
    await createGroup(groupName, workerIds);
    await loadGroups();
  };

  // edit existing group
  const editGroup = async (groupId, groupName, workerIds) => {
    await updateGroup(groupId, groupName, workerIds);
    await loadGroups();
  };

  // remove group
  const removeGroup = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    await deleteGroup(groupId);
    await loadGroups();
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return { groups, loading, addGroup, editGroup, removeGroup };
}
