import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../config/firebase";
import { mapOpportunityDoc } from "../../../utils/opportunityMapper";
import "./Applications.css";

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeStatus(status) {
  return String(status || "submitted").trim().toLowerCase();
}

function getStatusTone(status) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "shortlisted" || normalizedStatus === "interviewing") {
    return "shortlisted";
  }

  if (normalizedStatus === "rejected" || normalizedStatus === "declined") {
    return "declined";
  }

  return "review";
}

function formatStatus(status) {
  return normalizeStatus(status)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function loadOpportunity(opportunityId) {
  if (!opportunityId) {
    return null;
  }

  const opportunitySnap = await getDoc(doc(db, "opportunities", opportunityId));

  if (opportunitySnap.exists()) {
    return mapOpportunityDoc(opportunitySnap);
  }

  const opportunityQuery = query(
    collection(db, "opportunities"),
    where("opportunityID", "==", opportunityId)
  );
  const opportunityQuerySnap = await getDocs(opportunityQuery);

  return opportunityQuerySnap.docs[0] ? mapOpportunityDoc(opportunityQuerySnap.docs[0]) : null;
}

function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      if (!user) {
        setApplications([]);
        setLoadingApplications(false);
        return;
      }

      setLoadingApplications(true);
      setApplicationsError("");

      try {
        const applicationsQuery = query(
          collection(db, "applications"),
          where("studentId", "==", user.uid)
        );
        const applicationsSnap = await getDocs(applicationsQuery);
        const nextApplications = await Promise.all(
          applicationsSnap.docs.map(async (applicationDoc) => {
            const applicationData = applicationDoc.data();
            const opportunityId = applicationData.opportunityId || applicationData.opportunityID;
            const opportunity = await loadOpportunity(opportunityId);

            return {
              id: applicationDoc.id,
              applicationId: applicationData.applicationId || applicationDoc.id,
              appliedDate: formatDate(applicationData.appliedAt),
              coverLetterUrl: applicationData.coverLetterUrl,
              opportunityId,
              resumeUrl: applicationData.resumeUrl,
              status: normalizeStatus(applicationData.status),
              statusLabel: formatStatus(applicationData.status),
              statusTone: getStatusTone(applicationData.status),
              opportunity,
            };
          })
        );

        setApplications(nextApplications);
      } catch (err) {
        console.error("Failed to load applications:", err);
        setApplicationsError("Could not load your applications right now.");
      } finally {
        setLoadingApplications(false);
      }
    }

    loadApplications();
  }, [user]);

  const shortlistedCount = applications.filter((item) =>
    ["shortlisted", "interviewing"].includes(item.status)
  ).length;
  const declinedCount = applications.filter((item) =>
    ["rejected", "declined"].includes(item.status)
  ).length;

  return (
    <main className="applications-page">
      <div className="applications-shell">
        <div className="applications-heading">
          <div>
            <h1>My Applications</h1>
            <p>Track where each opportunity stands after you apply.</p>
          </div>
        </div>

        <div className="applications-summary">
          <div>
            <strong>{applications.length}</strong>
            <span>Total Applications</span>
          </div>
          <div>
            <strong>{shortlistedCount}</strong>
            <span>Shortlisted</span>
          </div>
          <div>
            <strong>{declinedCount}</strong>
            <span>Declined</span>
          </div>
        </div>

        {loadingApplications ? (
          <div className="applications-empty">
            <h2>Loading applications...</h2>
          </div>
        ) : applicationsError ? (
          <div className="applications-empty">
            <h2>{applicationsError}</h2>
          </div>
        ) : applications.length > 0 ? (
          <div className="applications-list">
            {applications.map((application) => (
              <article className="application-card" key={application.id}>
                <div className="application-card-top">
                  <div>
                    <h2>{application.opportunity?.title || "Opportunity not found"}</h2>
                    <p>
                      {application.opportunity?.company || "Company not specified"} |{" "}
                      {application.opportunity?.location || "Location not specified"}
                    </p>
                  </div>
                  <span className={`application-status ${application.statusTone}`}>
                    {application.statusLabel}
                  </span>
                </div>

                <p className="application-note">
                  Your application is currently marked as {application.statusLabel.toLowerCase()}.
                </p>

                <div className="application-meta">
                  <span>{application.opportunity?.type || "Opportunity"}</span>
                  <span>Applied: {application.appliedDate}</span>
                  <span>Deadline: {application.opportunity?.deadline || "Not specified"}</span>
                  {application.resumeUrl && (
                    <a href={application.resumeUrl} target="_blank" rel="noreferrer">
                      Resume
                    </a>
                  )}
                  {application.coverLetterUrl && (
                    <a href={application.coverLetterUrl} target="_blank" rel="noreferrer">
                      Cover Letter
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="applications-empty">
            <h2>No applications yet</h2>
            <p>Applications you submit from job opportunities will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Applications;
