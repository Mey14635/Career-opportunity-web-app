import applications from "../../data/applications";
import "./Applications.css";

function Applications() {
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
            <strong>{applications.filter((item) => item.status === "Shortlisted").length}</strong>
            <span>Shortlisted</span>
          </div>
          <div>
            <strong>{applications.filter((item) => item.status === "Declined").length}</strong>
            <span>Declined</span>
          </div>
        </div>

        <div className="applications-list">
          {applications.map((application) => (
            <article className="application-card" key={application.id}>
              <div className="application-card-top">
                <div>
                  <h2>{application.title}</h2>
                  <p>
                    {application.company} | {application.location}
                  </p>
                </div>
                <span className={`application-status ${application.statusTone}`}>
                  {application.status}
                </span>
              </div>

              <p className="application-note">{application.note}</p>

              <div className="application-meta">
                <span>{application.type}</span>
                <span>Applied: {application.appliedDate}</span>
                <span>Deadline: {application.deadline}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Applications;
