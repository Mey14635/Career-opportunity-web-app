import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import JobDetailsModal from "../../components/JobDetailsModal/JobDetailsModal";
import { db } from "../../firebase";
import { useAuth } from "../../Context/authContext";
import { mapOpportunityDoc } from "../../utils/opportunityMapper";
import "./Favorites.css";

function Favorites() {
  const [searchParams] = useSearchParams();
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
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
        const savedQuery = query(
          collection(db, "saved_opportunities"),
          where("userId", "==", user.uid)
        );
        const savedSnap = await getDocs(savedQuery);
        const opportunityIds = [
          ...new Set(
            savedSnap.docs
              .map((docSnap) => docSnap.data().opportunityID || docSnap.data().opportunityId)
              .filter(Boolean)
          ),
        ];
        const opportunitySnaps = await Promise.all(
          opportunityIds.map((opportunityID) => getDoc(doc(db, "opportunities", opportunityID)))
        );
        const nextSavedOpportunities = opportunitySnaps
          .filter((opportunitySnap) => opportunitySnap.exists())
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
                className="favorite-card"
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
                    <span aria-label="Saved">Saved</span>
                  </div>

                  <p className="favorite-company">
                    {opp.company} | {opp.location}
                  </p>
                  <p className="favorite-description">{opp.description}</p>

                  <div className="favorite-footer">
                    <span className="favorite-badge">{opp.type}</span>
                    <span className="favorite-closes">Deadline: {opp.deadline}</span>
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
        onSaved={(opportunityId, nextSaved) => {
          if (!nextSaved) {
            setSavedOpportunities((currentOpportunities) =>
              currentOpportunities.filter((opportunity) => opportunity.id !== opportunityId)
            );
            setSelectedOpportunity(null);
          }
        }}
        onClose={() => setSelectedOpportunity(null)}
      />
    </main>
  );
}

export default Favorites;
