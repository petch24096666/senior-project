import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Task from "./components/pages/KanbanBoard/Task";
import MainLayout from "./components/layouts/MainLayout";
import ProjectPage from "./components/pages/ProjectPage/ProjectPage"; 
import DashboardPage from "./components/pages/Dashboard/Dashboard";
import LoginPage from "./components/pages/SignUpSignInPage/Login";
import RegisterPage from "./components/pages/SignUpSignInPage/Register";
import ForgotpasswordPage from "./components/pages/SignUpSignInPage/ForgotPassword";
import CreateProjectModal from "./components/pages/KanbanBoard/AddTask";

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
                    <Route path="mytasks" element={<h1>My Tasks</h1>} />
                    <Route path="projects" element={<ProjectPage />} />
                    <Route path="calendar" element={<h1>Calendar</h1>} />
                    <Route path="messages" element={<h1>Messages</h1>} />
                    <Route path="documents" element={<h1>Documents</h1>} />
                    <Route path="task" element={<Task />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
  );
}

export default App;
