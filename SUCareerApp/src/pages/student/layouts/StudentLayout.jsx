import { Outlet } from "react-router-dom";
import Navbar from "../../../components/student/Navbar/Navbar";
import DeadlineNotificationChecker from "../../../components/student/Notifications/DeadlineNotificationChecker";
import "./StudentLayout.css";

function StudentLayout() {
  return (
    <div className="student-dashboard-shell">
      <Navbar />
      <DeadlineNotificationChecker />
      <Outlet />
    </div>
  );
}

export default StudentLayout;
