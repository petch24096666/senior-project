import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KanbanBoard from "./components/pages/KanbanBoard/KanbanBoard";
import MainLayout from "./components/layouts/MainLayout";
import ProjectPage from "./components/pages/ProjectPage/ProjectPage";
import DashboardPage from "./components/pages/Dashboard/Dashboard";
import LoginPage from "./components/pages/SignUpSignInPage/Login";
import RegisterPage from "./components/pages/SignUpSignInPage/Register";
import ForgotpasswordPage from "./components/pages/SignUpSignInPage/ForgotPassword";
import CalendarDashboard from "./components/pages/CalendarPage/Calendar";
import ProfilePage from "./components/pages/EditProfilePage/EditProfilePage";
import BookingPage from "./components/pages/BookingPage/BookingPage";
import MessagePage from "./components/pages/MessagePage/MessagePage";
import MeetingApp from "./components/pages/MeetingPage/MeetingPage";
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
                    <Route path="meeting" element={<MeetingApp />} />
                    <Route path="calendar" element={<CalendarDashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="messages" element={<MessagePage />} />
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
