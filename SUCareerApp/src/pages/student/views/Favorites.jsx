import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import JobDetailsModal from "../../../components/student/JobDetailsModal/JobDetailsModal";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { isStudentVisibleOpportunity, mapOpportunityDoc } from "../../../utils/opportunityMapper";
import "./Favorites.css";

function formatDaysLeft(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) {
    return "Deadline not set";
  }

  if (daysLeft === 0) {
    return "Due today";
  }

  return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
}

function Favorites() {
  const [searchParams] = useSearchParams();
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState("");
  const { user } = useAuth();
  const searchText = (searchParams.get("search") || "").trim().toLowerCase();

  useEffect(() => {
    async function loadSavedOpportunities() {
      if (!user) {
        setSavedOpportunities([]);
        setLoadingSaved(false);
        return;
      }

      setLoadingSaved(true);
      setSavedError("");

      try {
        const savedCollection = collection(db, "saved_opportunities");
        const [userSavedSnap, studentSavedSnap] = await Promise.all([
          getDocs(query(savedCollection, where("userId", "==", user.uid))),
          getDocs(query(savedCollection, where("studentId", "==", user.uid))),
        ]);
        const opportunityIds = [
          ...new Set(
            [...userSavedSnap.docs, ...studentSavedSnap.docs]
              .map((docSnap) => docSnap.data().opportunityId || docSnap.data().opportunityID)
              .filter(Boolean)
          ),
        ];
        const opportunitySnaps = await Promise.all(
          opportunityIds.map((opportunityID) => getDoc(doc(db, "opportunities", opportunityID)))
        );
        const nextSavedOpportunities = opportunitySnaps
          .filter((opportunitySnap) => opportunitySnap.exists())
          .filter((opportunitySnap) => isStudentVisibleOpportunity(opportunitySnap.data()))
          .map(mapOpportunityDoc)
          .filter(Boolean);

        setSavedOpportunities(nextSavedOpportunities);
      } catch (err) {
        console.error("Failed to load saved opportunities:", err);
        setSavedError("Could not load your saved opportunities right now.");
      } finally {
        setLoadingSaved(false);
      }
    }

    loadSavedOpportunities();
  }, [user]);

  useEffect(() => {
    async function loadAppliedOpportunities() {
      if (!user) {
        setAppliedOpportunityIds([]);
        return;
      }

      try {
        const applicationsSnap = await getDocs(query(
          collection(db, "applications"),
          where("studentId", "==", user.uid)
        ));
        const ids = [
          ...new Set(
            applicationsSnap.docs
              .map((docSnap) => docSnap.data().opportunityId || docSnap.data().opportunityID)
              .filter(Boolean)
          ),
        ];

        setAppliedOpportunityIds(ids);
      } catch (err) {
        console.error("Failed to load applied opportunities:", err);
      }
    }

    loadAppliedOpportunities();
  }, [user]);

  function markOpportunityApplied(opportunityId) {
    setAppliedOpportunityIds((currentIds) =>
      currentIds.includes(opportunityId) ? currentIds : [...currentIds, opportunityId]
    );
  }

  const filteredSavedOpportunities = savedOpportunities.filter((opp) => {
    if (!searchText) {
      return true;
    }

    return (
      opp.title.toLowerCase().includes(searchText) ||
      opp.company.toLowerCase().includes(searchText) ||
      opp.location.toLowerCase().includes(searchText) ||
      opp.type.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="favorites-page">
      <div className="favorites-shell">
        <div className="favorites-heading">
          <div>
            <h1>Your Saved Opportunities</h1>
            <p>
              {filteredSavedOpportunities.length} saved{" "}
              {filteredSavedOpportunities.length === 1 ? "opportunity" : "opportunities"}
            </p>
          </div>
        </div>

        {loadingSaved ? (
          <div className="favorites-empty">
            <h2>Loading saved opportunities...</h2>
          </div>
        ) : savedError ? (
          <div className="favorites-empty">
            <h2>{savedError}</h2>
          </div>
        ) : filteredSavedOpportunities.length > 0 ? (
          <div className="favorites-grid">
            {filteredSavedOpportunities.map((opp) => (
              <article
                key={opp.id}
                className={`favorite-card ${appliedOpportunityIds.includes(opp.id) ? "applied" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedOpportunity(opp)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedOpportunity(opp);
                  }
                }}
              >
                <div className="favorite-card-body">
                  <div className="favorite-card-top">
                    <h2>{opp.title}</h2>
                    <div className="favorite-card-tags">
                      {appliedOpportunityIds.includes(opp.id) && <span className="favorite-applied">Applied</span>}
                      <span aria-label="Saved">Saved</span>
                    </div>
                  </div>

                  <p className="favorite-company">
                    {opp.company} | {opp.location}
                  </p>
                  <p className="favorite-description">{opp.description}</p>

                  <div className="favorite-footer">
                    <span className="favorite-badge">{opp.type}</span>
                    <span className={`favorite-closes ${opp.daysLeft !== null && opp.daysLeft <= 2 ? "urgent" : ""}`}>
                      {formatDaysLeft(opp.daysLeft)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="favorites-empty">
            <h2>No saved opportunities found</h2>
            <p>Try a different search or save opportunities from your dashboard.</p>
          </div>
        )}
      </div>

      <JobDetailsModal
        opportunity={selectedOpportunity}
        saved={Boolean(selectedOpportunity)}
        applied={selectedOpportunity ? appliedOpportunityIds.includes(selectedOpportunity.id) : false}
        onSaved={(opportunityId, nextSaved) => {
          if (!nextSaved) {
            setSavedOpportunities((currentOpportunities) =>
              currentOpportunities.filter((opportunity) => opportunity.id !== opportunityId)
            );
            setSelectedOpportunity(null);
          }
        }}
        onApplied={markOpportunityApplied}
        onClose={() => setSelectedOpportunity(null)}
      />
    </main>
  );
}

export default Favorites;
