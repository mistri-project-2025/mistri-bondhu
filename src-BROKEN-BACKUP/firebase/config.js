// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc } from "firebase/firestore";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAQkuU0bQmlJbe257SSdZxQM-eclppCJ0k",
  authDomain: "mistri-bondhu.firebaseapp.com",
  projectId: "mistri-bondhu",
  storageBucket: "mistri-bondhu.appspot.com",
  messagingSenderId: "241132917437",
  appId: "1:241132917437:web:5cd4ff2368dce84f5d5dd4",
};

// ================= INITIALIZE APP =================
const app = initializeApp(firebaseConfig);

// ================= AUTH & FIRESTORE =================
export const auth = getAuth(app);
export const db = getFirestore(app);

// ================= COLLECTIONS =================
export const workersCollection = collection(db, "workers");
export const pendingWorkersCollection = collection(db, "pendingWorkers");
export const providersCollection = collection(db, "providers");
export const feedbackCollection = collection(db, "feedbacks");
export const leadsCollection = collection(db, "leads");
export const settingsCollection = collection(db, "settings");
export const likesCollection = collection(db, "likes");

// ================= DOC HELPERS =================
export const getWorkerDoc = (id) => doc(db, "workers", id);
export const getPendingWorkerDoc = (id) => doc(db, "pendingWorkers", id);
export const getProviderDoc = (id) => doc(db, "providers", id);
export const getFeedbackDoc = (id) => doc(db, "feedbacks", id);
export const getSettingsDoc = (key) => doc(db, "settings", key);
export const getLikesDoc = (id) => doc(db, "likes", id);
