import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KanbanBoard from "./components/pages/ProjectPage/KanbanBoard";
import MainLayout from "./components/layouts/MainLayout";
import ProjectPage from "./components/pages/ProjectPage/ProjectPage";
import SignIn from "./components/pages/SigninPage/SigninPage";
import SignUp from "./components/pages/SignupPage/SignupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/*" element={
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<h1>Dashboard</h1>} />
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
