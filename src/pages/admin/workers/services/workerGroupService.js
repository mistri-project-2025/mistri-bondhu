import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/config";

const groupRef = collection(db, "workerGroups");

// সব group fetch
export const getAllGroups = async () => {
  const snap = await getDocs(groupRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// নতুন group add
export const createGroup = async (
  groupName,
  workerIds,
  categoryId,
  great
) => {
  if (!groupName || workerIds.length === 0) {
    throw new Error("Group name & workers required");
  }

  if (!categoryId) {
    throw new Error("Category is required");
  }

  if (!great) {
    throw new Error("Great is required");
  }

  // 🔥 group size rule
  const sizeMap = {
    "A+": 4, "A": 4,
    "B+": 7, "B": 7,
    "C+": 10, "C": 10
  };

  const maxSize = sizeMap[great];

  if (workerIds.length > maxSize) {
    throw new Error(`Max ${maxSize} workers allowed for ${great}`);
  }

  const docRef = await addDoc(groupRef, {
    groupName,
    workers: workerIds,
    categoryId,   // 🔥 add
    great,        // 🔥 add
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
};
