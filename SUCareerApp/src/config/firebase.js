// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Core services used across frontend components
export const auth = getAuth(app);
export const db = getFirestore(app);

// Explicitly enforce local state persistence (survives tab/browser closures)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase auth persistence error:", error);
});

// Safe Analytics handling to avoid asynchronous export racing
let analyticsInstance = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  })
  .catch((err) => {
    console.warn("Analytics not supported or blocked by browser:", err);
  });

// A clean function your team can safely call anywhere without crashing the app
export const logEventSafely = (eventName, eventParams = {}) => {
  if (analyticsInstance) {
    import("firebase/analytics").then(({ logEvent }) => {
      logEvent(analyticsInstance, eventName, eventParams);
    });
  }
};