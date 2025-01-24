import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KanbanBoard from "./components/pages/ProjectPage/KanbanBoard";
import MainLayout from "./components/layouts/MainLayout";
import ProjectPage from "./components/pages/ProjectPage/ProjectPage"; 
import DashboardPage from "./components/pages/ProjectPage/Dashboard";
import LoginPage from "./components/pages/SignUpSignInPage/Login";
import RegisterPage from "./components/pages/SignUpSignInPage/Register";

function App() {
  return (
        <Router>
          <Routes>
            {/* เส้นทาง root โดยไม่มี Layout */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
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
                    <Route path="kanban" element={<KanbanBoard />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
  );
}

export default App;
