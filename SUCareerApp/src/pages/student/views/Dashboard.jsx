// src/views/student/Dashboard.jsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import OpportunityCard from "../../../components/student/OpportunityCard/OpportunityCard";
import JobDetailsModal from "../../../components/student/JobDetailsModal/JobDetailsModal";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { isStudentVisibleOpportunity, mapOpportunityDoc } from "../../../utils/opportunityMapper";
import "./Dashboard.css";

const defaultJobTypes = ["Internship", "Graduate Program", "Part-time", "Full-time"];
const defaultCategories = ["Technology", "Finance", "Healthcare", "Education", "Consulting", "Manufacturing", "Retail", "Other"];

function normalizeFilterValue(value) {
  return String(value || "")
    .replace(/["']/g, "")
    .replace(/[-_]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function compactFilterValue(value) {
  return normalizeFilterValue(value).replace(/\s+/g, "");
}

function singularizeFilterValue(value) {
  const normalizedValue = normalizeFilterValue(value);
  return normalizedValue.endsWith("s") ? normalizedValue.slice(0, -1) : normalizedValue;
}

function normalizeCategoryValue(value) {
  const normalizedValue = singularizeFilterValue(value);
  return normalizedValue === "tech" ? "technology" : normalizedValue;
}

function getCanonicalDefaultOption(defaultOptions, value) {
  const compactValue = compactFilterValue(value);
  if (compactValue === "tech" && defaultOptions.some((option) => compactFilterValue(option) === "technology")) {
    return "Technology";
  }
  return defaultOptions.find((option) => compactFilterValue(option) === compactValue) || value;
}

function buildFilterOptions(defaultOptions, opportunities, fieldName, config = {}) {
  const firestoreOptions = opportunities
    .map((opp) => opp[fieldName])
    .filter(Boolean)
    .filter((value) => !config.blocklist?.includes(singularizeFilterValue(value)));

  const filterOptions = [...defaultOptions, ...firestoreOptions].reduce((acc, value) => {
      const canonicalValue = getCanonicalDefaultOption(defaultOptions, value);
      const normalizedValue = config.normalizeValue
        ? config.normalizeValue(canonicalValue)
        : singularizeFilterValue(canonicalValue);

      if (
        !normalizedValue ||
        acc.some((item) =>
          (config.normalizeValue ? config.normalizeValue(item) : singularizeFilterValue(item)) === normalizedValue
        )
      ) {
        return acc;
      }

      return [...acc, canonicalValue];
    }, []);

  return filterOptions.sort((a, b) => String(a).localeCompare(String(b)));
}

const categoryBlocklist = ["general", ...defaultJobTypes.map(singularizeFilterValue)];

function Dashboard() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState([]);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
  const [studentInterests, setStudentInterests] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const searchText = (searchParams.get("search") || "").trim().toLowerCase();
  const opportunityIdFromUrl = searchParams.get("opportunity");
  const jobTypes = buildFilterOptions(defaultJobTypes, opportunities, "type");
  const categories = buildFilterOptions(defaultCategories, opportunities, "industry", {
    blocklist: categoryBlocklist,
    normalizeValue: normalizeCategoryValue,
  });

  useEffect(() => {
    async function loadOpportunities() {
      setLoadingOpportunities(true);
      setOpportunitiesError("");

      try {
        const opportunitiesSnap = await getDocs(query(collection(db, "opportunities")));
        const visibleOpportunities = opportunitiesSnap.docs
          .filter((docSnap) => isStudentVisibleOpportunity(docSnap.data()))
          .map(mapOpportunityDoc);

        setOpportunities(visibleOpportunities);
      } catch (err) {
        console.error("Failed to load opportunities:", err);
        setOpportunitiesError("Could not load opportunities right now.");
      } finally {
        setLoadingOpportunities(false);
      }
    }

    loadOpportunities();
  }, []);

  useEffect(() => {
    async function loadStudentInterests() {
      if (!user) {
        setStudentInterests([]);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "student_profiles", user.uid));
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        setStudentInterests(Array.isArray(profileData.interests) ? profileData.interests : []);
      } catch (err) {
        console.error("Failed to load student interests:", err);
        setStudentInterests([]);
      }
    }

    loadStudentInterests();
  }, [user]);

  useEffect(() => {
    async function loadSavedOpportunities() {
      if (!user) {
        setSavedOpportunityIds([]);
        return;
      }

      try {
        const savedCollection = collection(db, "saved_opportunities");
        const [userSavedSnap, studentSavedSnap] = await Promise.all([
          getDocs(query(savedCollection, where("userId", "==", user.uid))),
          getDocs(query(savedCollection, where("studentId", "==", user.uid))),
        ]);
        const ids = [
          ...new Set(
            [...userSavedSnap.docs, ...studentSavedSnap.docs]
              .map((docSnap) => docSnap.data().opportunityId || docSnap.data().opportunityID)
              .filter(Boolean)
          ),
        ];

        setSavedOpportunityIds(ids);
      } catch (err) {
        console.error("Failed to load saved opportunities:", err);
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

  function toggleFilter(value, list, setList, normalizeValue = normalizeFilterValue) {
    const normalizedValue = normalizeValue(value);
    if (list.includes(normalizedValue)) {
      setList(list.filter((item) => item !== normalizedValue));
    } else {
      setList([...list, normalizedValue]);
    }
  }

  const normalizedStudentInterests = studentInterests.map(normalizeCategoryValue);

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      searchText === "" ||
      opp.title.toLowerCase().includes(searchText) ||
      opp.company.toLowerCase().includes(searchText) ||
      opp.location.toLowerCase().includes(searchText) ||
      opp.type.toLowerCase().includes(searchText) ||
      opp.industry.toLowerCase().includes(searchText);

    const opportunityType = normalizeFilterValue(opp.type);
    const opportunityCategory = normalizeCategoryValue(opp.industry);
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.map(compactFilterValue).includes(compactFilterValue(opportunityType));
    const matchesIndustry =
      selectedIndustries.length === 0 ||
      selectedIndustries.map(normalizeCategoryValue).includes(opportunityCategory);

    return matchesSearch && matchesType && matchesIndustry;
  }).sort((a, b) => {
    const aMatchesInterest = normalizedStudentInterests.includes(normalizeCategoryValue(a.industry));
    const bMatchesInterest = normalizedStudentInterests.includes(normalizeCategoryValue(b.industry));

    if (aMatchesInterest === bMatchesInterest) {
      return 0;
    }

    return aMatchesInterest ? -1 : 1;
  });

  const linkedOpportunity = opportunityIdFromUrl
    ? opportunities.find((opp) => opp.id === opportunityIdFromUrl)
    : null;
  const activeOpportunity = selectedOpportunity || linkedOpportunity || null;

  function handleCloseOpportunityModal() {
    setSelectedOpportunity(null);
    if (opportunityIdFromUrl) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("opportunity");
      setSearchParams(nextParams);
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">Filter Opportunities</h2>

        <p className="filter-label">JOB TYPE</p>
        {jobTypes.map((type) => (
          <label key={type} className="filter-option">
            <input
              type="checkbox"
              checked={selectedTypes.includes(compactFilterValue(type))}
              onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes, compactFilterValue)}
            />
            {String(type).replace(/["']/g, "")}
          </label>
        ))}

        <p className="filter-label">CATEGORY</p>
        {categories.map((category) => (
          <label key={category} className="filter-option">
            <input
              type="checkbox"
              checked={selectedIndustries.includes(normalizeCategoryValue(category))}
              onChange={() =>
                toggleFilter(category, selectedIndustries, setSelectedIndustries, normalizeCategoryValue)
              }
            />
            {String(category).replace(/["']/g, "")}
          </label>
        ))}
      </aside>

      <main className="main-content">
        <div className="section-heading">
          <h1>Recommended for You</h1>
          <p>{filtered.length} opportunities matching your profile</p>
        </div>

        <div className="cards-grid">
          {loadingOpportunities ? (
            <p className="no-results">Loading opportunities...</p>
          ) : opportunitiesError ? (
            <p className="no-results">{opportunitiesError}</p>
          ) : filtered.length > 0 ? (
            filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                title={opp.title}
                company={opp.company}
                employerId={opp.employerId}   // ← FIXED: now uses correct field name
                location={opp.location}
                description={opp.description}
                type={opp.type}
                daysLeft={opp.daysLeft}
                deadline={opp.deadline}
                saved={savedOpportunityIds.includes(opp.id)}
                applied={appliedOpportunityIds.includes(opp.id)}
                onSaved={(opportunityId, nextSaved) =>
                  setSavedOpportunityIds((currentIds) => {
                    if (nextSaved) {
                      return currentIds.includes(opportunityId) ? currentIds : [...currentIds, opportunityId];
                    }
                    return currentIds.filter((id) => id !== opportunityId);
                  })
                }
                onOpen={() => setSelectedOpportunity(opp)}
              />
            ))
          ) : (
            <p className="no-results">
              {opportunities.length === 0
                ? "No opportunities found in Firestore yet."
                : "No opportunities match your filters."}
            </p>
          )}
        </div>
      </main>

      <JobDetailsModal
        opportunity={activeOpportunity}
        saved={activeOpportunity ? savedOpportunityIds.includes(activeOpportunity.id) : false}
        applied={activeOpportunity ? appliedOpportunityIds.includes(activeOpportunity.id) : false}
        onSaved={(opportunityId, nextSaved) =>
          setSavedOpportunityIds((currentIds) => {
            if (nextSaved) {
              return currentIds.includes(opportunityId) ? currentIds : [...currentIds, opportunityId];
            }
            return currentIds.filter((id) => id !== opportunityId);
          })
        }
        onApplied={markOpportunityApplied}
        onClose={handleCloseOpportunityModal}
      />
    </div>
  );
}

export default Dashboard;
