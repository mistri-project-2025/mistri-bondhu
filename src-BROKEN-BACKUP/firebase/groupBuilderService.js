// src/firebase/groupBuilderService.js

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./config";

// GROUP SIZE
const GROUP_SIZE = {
  "A+": 5,
  "A": 5,

  "B+": 7,
  "B": 7,

  "C+": 10,
  "C": 10,
};

export const getGroupSize = (great) => {
  return GROUP_SIZE[great] || 5;
};

// ====================================
// AUTO FIND NEXT GROUP
// ====================================

export const getNextGroupData = async (
  categoryId,
  great
) => {
  const size = getGroupSize(great);

  const q = query(
    collection(db, "workers"),
    where("categoryId", "==", categoryId),
    where("great", "==", great),
    where("status", "==", "approved")
  );

  const snap = await getDocs(q);

  const workers = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // no worker yet
  if (workers.length === 0) {
    return {
      groupNo: 1,
      groupLabel: `1${great}`,
    };
  }

  // count groups
  const groups = {};

  workers.forEach((w) => {
    const no = w.groupNo || 1;

    if (!groups[no]) {
      groups[no] = 0;
    }

    groups[no]++;
  });

  const sorted = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  // find first non-full group
  for (const no of sorted) {
    if (groups[no] < size) {
      return {
        groupNo: no,
        groupLabel: `${no}${great}`,
      };
    }
  }

  // create next group
  const nextNo =
    sorted[sorted.length - 1] + 1;

  return {
    groupNo: nextNo,
    groupLabel: `${nextNo}${great}`,
  };
};
