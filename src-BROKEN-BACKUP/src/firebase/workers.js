// src/firebase/workers.js
import { db } from "./config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Phone gate check + lock
 * phone = document ID
 */

// ✅ check phone already exists
export const isPhoneRegistered = async (phone) => {
  const ref = doc(db, "phoneIndex", phone);
  const snap = await getDoc(ref);
  return snap.exists();
};

// ✅ lock phone (call only AFTER duplicate check)
export const lockPhoneNumber = async ({ phone, uid, role }) => {
  const ref = doc(db, "phoneIndex", phone);

  await setDoc(ref, {
    uid,
    role,
    createdAt: serverTimestamp(),
  });
};
