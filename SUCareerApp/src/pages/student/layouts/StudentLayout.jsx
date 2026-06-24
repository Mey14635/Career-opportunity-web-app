import { Outlet } from "react-router-dom";
import Navbar from "../../../components/student/Navbar/Navbar";
import DeadlineNotificationChecker from "../../../components/student/Notifications/DeadlineNotificationChecker";

function StudentLayout() {
  return (
    <>
      <Navbar />
      <DeadlineNotificationChecker />
      <Outlet />
    </>
  );
}

export default StudentLayout;
