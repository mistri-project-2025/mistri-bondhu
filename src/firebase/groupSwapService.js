import { doc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "./config";

// 🔥 CHECKBOX MULTI SWAP FUNCTION
// selectedWorkersA: Group A থেকে সিলেক্ট করা worker ID গুলোর array
// selectedWorkersB: Group B থেকে সিলেক্ট করা worker ID গুলোর array
// groupA: Group A এর নাম যেমন "1A+", "A", "B+"
// groupB: Group B এর নাম যেমন "6A+", "B", "C+"

export const swapGroups = async (
  selectedWorkersA,
  selectedWorkersB,
  groupA,
  groupB
) => {
  try {
    // =========================
    // 1. VALIDATION
    // =========================
    if (!selectedWorkersA ||!selectedWorkersB) {
      return {
        success: false,
        error: "Worker list missing",
      };
    }

    if (selectedWorkersA.length === 0 || selectedWorkersB.length === 0) {
      return {
        success: false,
        error: "Please select workers from both groups",
      };
    }

    if (selectedWorkersA.length!== selectedWorkersB.length) {
      return {
        success: false,
        error: `Both groups must have equal workers. Selected: ${selectedWorkersA.length} vs ${selectedWorkersB.length}`,
      };
    }

    if (!groupA ||!groupB) {
      return {
        success: false,
        error: "Group names missing",
      };
    }

    if (groupA === groupB) {
      return {
        success: false,
        error: "Cannot swap workers in same group",
      };
    }

    // =========================
    // 2. FIREBASE BATCH UPDATE
    // =========================
    const batch = writeBatch(db);
    const timestamp = new Date().toISOString();

    // Group A এর worker গুলো Group B তে পাঠাও
    for (const workerId of selectedWorkersA) {
      const workerRef = doc(db, "workers", workerId);
      
      // Optional: Check if worker exists
      const workerSnap = await getDoc(workerRef);
      if (!workerSnap.exists()) {
        console.warn(`Worker ${workerId} not found, skipping`);
        continue;
      }

      batch.update(workerRef, {
        groupLabel: groupB,
        updatedAt: timestamp,
        lastSwapFrom: groupA,
        lastSwapAt: timestamp,
      });
    }

    // Group B এর worker গুলো Group A তে পাঠাও
    for (const workerId of selectedWorkersB) {
      const workerRef = doc(db, "workers", workerId);
      
      // Optional: Check if worker exists
      const workerSnap = await getDoc(workerRef);
      if (!workerSnap.exists()) {
        console.warn(`Worker ${workerId} not found, skipping`);
        continue;
      }

      batch.update(workerRef, {
        groupLabel: groupA,
        updatedAt: timestamp,
        lastSwapFrom: groupB,
        lastSwapAt: timestamp,
      });
    }

    // Commit all changes at once
    await batch.commit();

    // =========================
    // 3. SUCCESS RESPONSE
    // =========================
    return {
      success: true,
      message: `Successfully swapped ${selectedWorkersA.length} workers between ${groupA} and ${groupB}`,
      data: {
        swappedCount: selectedWorkersA.length,
        groupA: groupA,
        groupB: groupB,
        timestamp: timestamp,
      },
    };
  } catch (err) {
    console.error("Swap Groups Error:", err);
    return {
      success: false,
      error: err.message || "Unknown error occurred during swap",
    };
  }
};

// 🔥 OPTIONAL: SWAP WITH CUSTOM TARGET GROUPS
// যদি তুমি চাও Group A -> "6A+" আর Group B -> "1A+" এ যাবে fixed ভাবে
export const swapGroupsFixed = async (
  selectedWorkersA,
  selectedWorkersB
) => {
  return await swapGroups(
    selectedWorkersA,
    selectedWorkersB,
    "1A+",  // Group A এর worker রা 6A+ এ যাবে
    "6A+"   // Group B এর worker রা 1A+ এ যাবে
  );
};

// 🔥 OPTIONAL: SINGLE WORKER SWAP
export const swapSingleWorker = async (workerId, newGroupLabel) => {
  try {
    const workerRef = doc(db, "workers", workerId);
    await updateDoc(workerRef, {
      groupLabel: newGroupLabel,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
