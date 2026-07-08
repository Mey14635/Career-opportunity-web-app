// Core Firebase imports combined cleanly
import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

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

// Export core services for your team to use across the frontend
export const auth = getAuth(app);
export const db = getFirestore(app);

// Explicitly enforce local state persistence (survives tab/browser closures)
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Safe Analytics handling to avoid asynchronous export racing
let analyticsInstance = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  })
  .catch(() => {});

// A clean function your team can safely call anywhere without crashing the app
export const logEventSafely = (eventName, eventParams = {}) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, eventName, eventParams);
  }
};