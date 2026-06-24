import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import StudentDashboard from "./pages/student/StudentDashboard";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <StudentDashboard />
      </Router>
    </AuthProvider>
  );
}

export default App;
