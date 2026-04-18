// setAdminPassword.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Admin user UID
const uid = "rXerVUO2FBZ0hudu4t5h8nBZUfh1";

// নতুন password দিন
const newPassword = "8584982067"; // আপনার পছন্দের password

admin.auth().updateUser(uid, {
  password: newPassword,
})
.then((userRecord) => {
  console.log(`✅ Password updated for UID: ${userRecord.uid}`);
})
.catch((err) => {
  console.error("❌ Error updating password:", err);
});
