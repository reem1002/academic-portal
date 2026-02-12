import { BrowserRouter, Routes, Route } from "react-router-dom";
import PortalLayout from "./pages/PortalLayout";
import PreRegistrationPage from "./pages/PreRegisterationPage";
import StudentSelectionsPage from "./pages/StudentSelectionsPage";
import Dashboard from "./pages/Dashboard";
import HODCoursesPage from "./pages/HODCoursesPage";
import LoginPage from "./pages/LoginPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import SemesterHistoryPage from "./pages/SemesterHistoryPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PortalLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pre-registration" element={<PreRegistrationPage />} />
          <Route path="hod-courses" element={<HODCoursesPage />} />
          <Route path="student-selections" element={<StudentSelectionsPage />} />
          <Route path="/course/:code" element={<CourseDetailsPage />} />
          <Route path="/semester-history" element={<SemesterHistoryPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
