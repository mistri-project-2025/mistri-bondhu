// migrateToUsersSafe.js
// Node.js + firebase-admin version
import admin from "firebase-admin";
import fs from "fs";

// 🔑 Service account key
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Collections mapping
const collections = [
  { name: "admins", role: "admin", status: "active" },
  { name: "workers", role: "worker", status: "approved" },
  { name: "pendingWorkers", role: "worker", status: "pending" },
  { name: "providers", role: "provider", status: "approved" },
];

async function migrate() {
  for (const col of collections) {
    console.log(`Migrating ${col.name}...`);
    const snap = await db.collection(col.name).get();

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const userId = docSnap.id;

      // Check if already exists
      const userRef = db.collection("users").doc(userId);
      const existingUser = await userRef.get();

      if (existingUser.exists) {
        console.log(`⚠️ User ${userId} already exists, skipping`);
        continue;
      }

      const userData = {
        uid: userId,
        role: col.role,
        status: col.status,
        ...data, // original fields
      };

      await userRef.set(userData);
      console.log(`✅ Migrated ${col.name} → users: ${userId}`);
    }
  }
  console.log("🎉 Migration completed safely!");
}

// Run migration
migrate().catch((err) => {
  console.error("Migration failed:", err);
});
