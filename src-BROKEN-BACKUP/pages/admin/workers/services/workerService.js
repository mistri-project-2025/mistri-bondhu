import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/config";

export const approveWorker = async (id) => {
  await updateDoc(doc(db, "workers", id), { status: "approved" });
};

export const expireWorker = async (id) => {
  await updateDoc(doc(db, "workers", id), { status: "expired" });
};
