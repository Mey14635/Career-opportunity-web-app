import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext"; 
import Button from "../../../components/shared/Button/Button";
import "./profile.css";

const Profile = () => {
  const { user, hasProfile, refreshAuthStatus } = useAuth(); 
  const [academicStatus, setAcademicStatus] = useState("");
  const [course, setCourse] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    yearOfStudy: "",
    course: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const interestsOptions = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Consulting",
    "Manufacturing",
    "Retail",
    "Other",
  ];

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      setProfileLoading(true);
      setError("");

      try {
        const userSnap = await getDoc(doc(db, "user", user.uid));
        const profileSnap = await getDoc(doc(db, "student_profiles", user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        const profileData = profileSnap.exists() ? profileSnap.data() : {};

        setProfileForm({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.personalEmail || userData.email || user.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          yearOfStudy: profileData.yearOfStudy || "",
          course: profileData.course || "",
        });

        setSelectedInterests(profileData.interests || []);
      } catch {
        setError("Failed to load your profile details. Please refresh and try again.");
    } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleProfileInputChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!user) {
      setError("No authenticated session detected. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const displayName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`;

      await updateProfile(user, { displayName });

      await setDoc(doc(db, "student_profiles", user.uid), {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        personalEmail: profileForm.email,
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        yearOfStudy: profileForm.yearOfStudy,
        course: profileForm.course,
        interests: selectedInterests,
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await setDoc(doc(db, "user", user.uid), {
        email: profileForm.email,
        displayName,
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await refreshAuthStatus();
      setSuccess("Profile changes saved successfully.");
    } catch (err) {
      setError("Failed to save profile changes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");

    if (!academicStatus || !course) {
      setError("Please select your academic status and course of study.");
      return;
    }

    if (selectedInterests.length === 0) {
      setError("Please select at least one industry interest to customize your feed.");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const profileRef = doc(db, "student_profiles", user.uid);
        await setDoc(profileRef, {
          yearOfStudy: academicStatus,
          course: course,
          interests: selectedInterests,
          profileCompleted: true, 
          updatedAt: serverTimestamp(),
        }, { merge: true });

        const userRef = doc(db, "user", user.uid);
        await setDoc(userRef, {
          profileCompleted: true, 
          updatedAt: serverTimestamp(),
        }, { merge: true });

        await refreshAuthStatus();

        // FIXED: Added full path to ensure it stays within the student portal
        navigate("/student-dashboard/dashboard", { replace: true });
      } catch (err) {
        setError("Failed to save profile configuration: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError("No authenticated session detected. Please log in again.");
    }
  };

  if (hasProfile) {
    const initial = (profileForm.firstName || user?.displayName || user?.email || "U").trim().charAt(0).toUpperCase();

    return (
      <div className="profile-page">
        <div className="profile-shell">
          <div className="profile-header-card">
            {/* FIXED: Added full path to the back button */}
            <button className="profile-back-btn" type="button" onClick={() => navigate("/student-dashboard/dashboard")}>
              Back to Dashboard
            </button>
            <div className="profile-avatar">{initial}</div>
            <div>
              <h1>{profileForm.firstName || "Student"} {profileForm.lastName}</h1>
              <p>{profileForm.email}</p>
            </div>
          </div>

          <div className="profile-settings-card">
            <div className="profile-section-title">
              <h2>Profile Settings</h2>
              <p>Update your personal and academic information.</p>
            </div>

            {profileLoading && <div className="auth-alert alert-info">Loading your profile...</div>}
            {error && <div className="auth-alert alert-danger">{error}</div>}
            {success && <div className="auth-alert alert-success">{success}</div>}

            <form onSubmit={handleSaveSettings} className="profile-settings-form">
              <div className="profile-form-row">
                <div className="profile-field">
                  <label>First Name</label>
                  <input name="firstName" value={profileForm.firstName} onChange={handleProfileInputChange} />
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <input name="lastName" value={profileForm.lastName} onChange={handleProfileInputChange} />
                </div>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <input name="email" value={profileForm.email} readOnly />
              </div>

              <div className="profile-form-row">
                <div className="profile-field">
                  <label>Phone</label>
                  <input name="phone" value={profileForm.phone} onChange={handleProfileInputChange} placeholder="Add phone number" />
                </div>
                <div className="profile-field">
                  <label>Address</label>
                  <input name="address" value={profileForm.address} onChange={handleProfileInputChange} placeholder="Add address" />
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-field">
                  <label>Current Academic Status</label>
                  <select name="yearOfStudy" value={profileForm.yearOfStudy} onChange={handleProfileInputChange}>
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
                <div className="profile-field">
                  <label>Course of Study</label>
                  <select name="course" value={profileForm.course} onChange={handleProfileInputChange}>
                    <option value="">Select your course</option>
                    <option value="BSc. Computer Science">BSc. Computer Science</option>
                    <option value="BSc. Business Information Technology">BSc. Business Information Technology</option>
                    <option value="Bachelor of Commerce">Bachelor of Commerce</option>
                    <option value="BSc. Informatics and Computer Science">BSc. Informatics and Computer Science</option>
                  </select>
                </div>
              </div>

              <div className="interests-section">
                <label>Industry Interests</label>
                <div className="tags-grid">
                  {interestsOptions.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleTagToggle(interest)}
                        className={`interest-tag ${isSelected ? "selected" : ""}`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" disabled={loading || profileLoading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-container">
      <div className="onboard-card">
        <div className="onboard-brand">
          <div className="brand-logo" aria-hidden="true">
            SU
          </div>
          <p>SU Career Portal</p>
        </div>

        <div className="onboard-steps">
          <div className="step-item completed">
            <span className="step-badge">✓</span>
            <p>Account</p>
          </div>
          <div className="step-line active"></div>
          <div className="step-item active">
            <span className="step-badge">2</span>
            <p>Profile</p>
          </div>
        </div>

        <div className="onboard-header">
          <h2>Complete Your Profile to Personalize Your Feed</h2>
          <p>Help us tailor opportunities to your academic journey and career goals.</p>
        </div>

        {error && <div className="auth-alert alert-danger">{error}</div>}

        <form onSubmit={handleSaveProfile} className="onboard-form">
          
          <div className="select-group">
            <label>Current Academic Status</label>
            <select 
              value={academicStatus} 
              onChange={(e) => setAcademicStatus(e.target.value)}
              className="custom-select"
            >
              <option value="" disabled>Select Year (e.g., 3rd Year, Alumni)</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          <div className="select-group">
            <label>Course of Study</label>
            <select 
              value={course} 
              onChange={(e) => setCourse(e.target.value)}
              className="custom-select"
            >
              <option value="" disabled>Select your course</option>
              <option value="BSc. Computer Science">BSc. Computer Science</option>
              <option value="BSc. Business Information Technology">BSc. Business Information Technology</option>
              <option value="Bachelor of Commerce">Bachelor of Commerce</option>
              <option value="BSc. Informatics and Computer Science">BSc. Informatics and Computer Science</option>
            </select>
          </div>

          <div className="interests-section">
            <label>Industry Interests</label>
            <p className="interests-sub">Select the industries you want to see first</p>
            
            <div className="tags-grid">
              {interestsOptions.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleTagToggle(interest)}
                    className={`interest-tag ${isSelected ? "selected" : ""}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="onboard-submit" disabled={loading}>
            {loading ? "Saving..." : "Save & Go to Dashboard ->"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
