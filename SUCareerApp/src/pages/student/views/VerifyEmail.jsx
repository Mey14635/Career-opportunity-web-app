import { useCallback, useEffect, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../config/firebase";
import AuthAlert from "../../../components/shared/Auth/AuthAlert";
import AuthCard from "../../../components/shared/Auth/AuthCard";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const pendingRegistrationKey = "pendingStudentRegistration";
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Waiting for email verification... Please check your inbox.");
  const [savingVerifiedUser, setSavingVerifiedUser] = useState(false);
  const [complete, setComplete] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const getPendingRegistration = useCallback(() => {
    const rawValue = window.localStorage.getItem(pendingRegistrationKey);
    if (!rawValue) return null;
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }, []);

  const createStudentRecords = useCallback(async (verifiedUid, verifiedEmail, displayName) => {
    const [firstName = "", ...lastNameParts] = (displayName || "").split(" ");
    const lastName = lastNameParts.join(" ");

    try {
      const userRef = doc(db, "user", verifiedUid);
      const userSnap = await getDoc(userRef);
      const userData = {
        uid: verifiedUid,
        email: verifiedEmail,
        role: "student",
        isActive: true,
        profileCompleted: false,
      };

      if (!userSnap.exists() || !userSnap.data().createdAt) {
        userData.createdAt = serverTimestamp();
      }

      // Create user auth profile document
      await setDoc(userRef, userData, { merge: true });

      // Create student detailed meta profile document
      await setDoc(doc(db, "student_profiles", verifiedUid), {
        uid: verifiedUid,
        firstName,
        lastName,
        personalEmail: verifiedEmail,
        profileCompleted: false,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      window.localStorage.removeItem(pendingRegistrationKey);
      setComplete(true);
      setStatus("Email confirmed! Redirecting you to complete your profile setup...");

      window.setTimeout(() => {
        navigate("/student-dashboard/profile", { replace: true });
      }, 1500);

      return true;
    } catch (err) {
      console.error("Firestore write failure:", err);
      setError("Authenticated successfully, but failed to initialize your database records. Please try logging in.");
      return false;
    }
  }, [navigate]);

  //  Handles the tab that actually opened the email link 
  useEffect(() => {
    const applyEmailCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      if (mode !== "verifyEmail" || !oobCode) return;

      try {
        await applyActionCode(auth, oobCode);
        setEmailConfirmed(true);
        setStatus("Email verified successfully! You can return to your original browser tab or log in.");
      } catch (err) {
        console.error(err);
        setError("This verification link is invalid or has expired.");
      }
    };

    applyEmailCode();
  }, []);

  //  The Cross-Browser Tracker Loop
  useEffect(() => {
    if (complete || savingVerifiedUser) return undefined;

    const checkEmailVerification = async () => {
      let user = auth.currentUser;
      const pendingRegistration = getPendingRegistration();

     
      if (user) {
        try {
          // Force a network reload to catch verification updates from the other browser
          await user.reload(); 
          user = auth.currentUser; 

          if (user && user.emailVerified) {
            setSavingVerifiedUser(true);
            const displayName = user.displayName || (pendingRegistration ? pendingRegistration.displayName : "");
            await createStudentRecords(user.uid, user.email, displayName);
            setSavingVerifiedUser(false);
          }
        } catch (err) {
          console.error("Error refreshing cloud token state:", err);
        }
        return;
      }

      if (!user && emailConfirmed && pendingRegistration) {
        setSavingVerifiedUser(true);
        await createStudentRecords(pendingRegistration.uid, pendingRegistration.email, pendingRegistration.displayName);
        setSavingVerifiedUser(false);
      }
    };

    // Poll every 3 seconds, and instantly check whenever they switch back to this browser tab window
    const intervalId = window.setInterval(checkEmailVerification, 3000);
    window.addEventListener("focus", checkEmailVerification);
    checkEmailVerification();

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkEmailVerification);
    };
  }, [complete, createStudentRecords, emailConfirmed, getPendingRegistration, savingVerifiedUser]);

  return (
    <AuthCard title="Verify Email" subtitle="Completing your SU Career Portal registration">
      <AuthAlert message={error} type="danger" />
      <AuthAlert message={status} type={complete ? "success" : "info"} />
    </AuthCard>
  );
};

export default VerifyEmail;
