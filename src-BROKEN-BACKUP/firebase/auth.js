// src/firebase/auth.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { auth } from "./config";

// ---------- Google Login ----------
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// ---------- Phone OTP ----------
let confirmationResult = null;

export const sendOTP = async (phoneNumber) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
  }

  confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
  );

  return true;
};

export const verifyOTP = async (otp) => {
  if (!confirmationResult) {
    throw new Error("OTP not sent");
  }

  const result = await confirmationResult.confirm(otp);
  return result.user;
};

// ---------- Logout ----------
export const logoutUser = () => {
  return signOut(auth);
};
