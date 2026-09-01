import {
  collection,
  getDocs,
  writeBatch,
  query,
  where,
} from "firebase/firestore";

import { db } from "./config";

// GROUP SIZE RULE
const GROUP_SIZE = {
  "A+": 5,
  "A": 5,
  "B+": 7,
  "B": 7,
  "C+": 10,
  "C": 10,
};

// size return
const getSize = (great) => GROUP_SIZE[great] || 5;

// 🔥 MAIN REBUILD FUNCTION
export const rebuildAllGroups = async () => {
  try {
    const snap = await getDocs(
      query(collection(db, "workers"), where("status", "==", "approved"))
    );

    const workers = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // STEP 1: CATEGORY + GREAT wise split
    const grouped = {};

    workers.forEach((w) => {
      const key = `${w.categoryId}_${w.great}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(w);
    });

    const batch = writeBatch(db);

    // STEP 2: rebuild each group
    Object.keys(grouped).forEach((key) => {
      const list = grouped[key];

      const sampleGreat = list[0]?.great;
      const size = getSize(sampleGreat);

      let groupNo = 1;
      let count = 0;

      list.forEach((worker, index) => {
        if (count >= size) {
          groupNo++;
          count = 0;
        }

        const groupLabel = `${groupNo}${worker.great}`;

        const ref = workers.find(w => w.id === worker.id);

        const docRef = docRefSafe(worker.id);

        batch.update(docRef, {
          groupNo,
          groupLabel,
        });

        count++;
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Groups rebuilt successfully",
    };

  } catch (err) {
    console.error("Rebuild Error:", err);
    return {
      success: false,
      error: err.message,
    };
  }
};

// safe doc ref helper
import { doc } from "firebase/firestore";

const docRefSafe = (id) => {
  return doc(db, "workers", id);
};
