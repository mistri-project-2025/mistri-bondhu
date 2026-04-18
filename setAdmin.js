// setAdmin.js
const admin = require("firebase-admin");

// Firebase service account JSON path দিন
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// rXerVUO2FBZ0hudu4t5h8nBZUfh1 এই UID-এর user কে admin বানাব
const uid = "rXerVUO2FBZ0hudu4t5h8nBZUfh1";

admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log(`✅ User ${uid} is now admin`);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
  });
