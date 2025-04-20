import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KanbanBoard from "./components/pages/KanbanBoard/KanbanBoard";
import MainLayout from "./components/layouts/MainLayout";
import ProjectPage from "./components/pages/ProjectPage/ProjectPage";
import DashboardPage from "./components/pages/Dashboard/Dashboard";
import LoginPage from "./components/pages/SignUpSignInPage/Login";
import RegisterPage from "./components/pages/SignUpSignInPage/Register";
import ForgotpasswordPage from "./components/pages/SignUpSignInPage/ForgotPassword";
import CalendarApp from "./components/pages/CalendarPage/ModernCalendar";
import ProfilePage from "./components/pages/EditProfilePage/EditProfilePage";
import BookingPage from "./components/pages/BookingPage/BookingPage";
import MeetingPage from './components/pages/MeetingPage/MeetingPage';
import MeetingList from './components/pages/MeetingPage/MeetingList';
import TaskPage from "./components/pages/TaskPage/TaskPage";
import ResetPassword from "./components/pages/SignUpSignInPage/ResetPassword ";


function App() {
  return (
    <Router>
      <Routes>
        {/* เส้นทาง root โดยไม่มี Layout */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotpasswordPage />} />

        {/* เส้นทางที่ใช้ MainLayout */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="mytasks" element={<TaskPage />} />
                <Route path="projects" element={<ProjectPage />} />
                <Route path="meeting" element={<MeetingPage />} />
                <Route path="meeting/list" element={<MeetingList />} />
                <Route path="calendar" element={<CalendarApp />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="/task/:projectId" element={<KanbanBoard />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
