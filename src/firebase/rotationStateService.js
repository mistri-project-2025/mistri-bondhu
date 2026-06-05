// src/firebase/rotationStateService.js

import { db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "rotationState";

// GET CURRENT STATE
export const getRotationState = async (categoryId) => {
  const ref = doc(db, COLLECTION, categoryId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      categoryId,
      pointer: {
        gradeIndex: 0, // A+, A, B+...
        groupIndex: 0, // 1,2,3...
      },
    };
  }

  return snap.data();
};

// SAVE STATE
export const saveRotationState = async (categoryId, data) => {
  const ref = doc(db, COLLECTION, categoryId);

  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// UPDATE POINTER
export const updateRotationState = async (categoryId, pointer) => {
  const ref = doc(db, "rotationState", categoryId);

  await setDoc(
    ref,
    {
      pointer,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
