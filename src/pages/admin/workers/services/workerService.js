import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/config";

const workersRef = collection(db, "workers");

export const getAllWorkers = async () => {
  const snap = await getDocs(workersRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// 🔥 APPROVE
export const approveWorker = async (workerId, great, contractEnd) => {
  const ref = doc(db, "workers", workerId);

  let finalEnd = contractEnd;

  if (!contractEnd) {
    const end = new Date();

    if (["A+", "B+", "C+"].includes(great)) {
      end.setMonth(end.getMonth() + 12);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    finalEnd = end.toISOString();
  }

  await setDoc(
    ref,
    {
      status: "approved",
      approved: true,
      great,
      approvalDate: new Date().toISOString(),
      contractEnd: finalEnd,
    },
    { merge: true }
  );
};

// 🔥 EXPIRE
export const expireWorker = async (workerId) => {
  const ref = doc(db, "workers", workerId);

  await updateDoc(ref, {
    status: "expired",
    approved: false,
  });
};
