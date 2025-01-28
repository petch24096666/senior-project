import React, { useEffect, useState } from "react";
import axios from "axios";
import { MoreOptionsButton, AddProjectButton } from "../../common/button"
import SearchBar from "../../common/searchbar";
import CreateProjectModal from "./AddProject";
import ProjectCard from "../../common/projectcard"
import ConfirmationPopup from "../../common/ConfirmationPopup";
const url = import.meta.env.VITE_BACKEND_URL;


const styles = {
  projectList: {
    padding: "32px 22px",
    maxWidth: "calc(100% - 44px)",
    margin: "0 auto",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },
  header: {
    fontFamily: "Inter, sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "24px",
    margin: 0,
  },
  description: {
    fontFamily: "Inter, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "20px",
    color: "#6B7280",
    marginTop: "8px",
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    columnGap: "24px",
    rowGap: "32px",
  },
};




const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // เพิ่ม state สำหรับเก็บค่าค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // เก็บ ID ของโปรเจ็กต์ที่เลือก
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${url}/api/projects`);
      console.log("Fetched projects:", response.data);
      setProjects(response.data.data || []);
      setFilteredProjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");

    if (normalizedQuery === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) => {
        const normalizedTitle = project.title.toLowerCase().replace(/\s+/g, "");
        return normalizedTitle.includes(normalizedQuery);
      });
      setFilteredProjects(filtered);
    }
  };

  const handleOpenPopup = (projectId) => {
    setSelectedProjectId(projectId); // เก็บ ID ของโปรเจ็กต์ที่ต้องการลบ
    setIsPopupOpen(true); // เปิด Popup
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false); // ปิด Popup
    setSelectedProjectId(null); // ล้างค่า ID ที่เลือก
  };

  const handleConfirmDelete = async () => {
    if (!selectedProjectId) return; // ตรวจสอบว่า ID ไม่เป็น null
    try {
      await axios.delete(`${url}/api/projects/${selectedProjectId}`);
      console.log(`Project with ID ${selectedProjectId} deleted.`);
      fetchProjects(); // ดึงข้อมูลใหม่หลังจากลบ
      handleClosePopup(); // ปิด Popup หลังลบสำเร็จ
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete the project. Please try again.");
    }
  };

  const handleEdit = () => {
    console.log("Edit clicked");
  };


  return (
    <div style={styles.projectList}>
      <div style={styles.headerContainer}>
        <div>
          <h1 style={styles.header}>Projects</h1>
          <p style={styles.description}>
            Get an overview of your projects and track progress.
          </p>
        </div>
        <div style={styles.buttonContainer}>
          <SearchBar
            placeholder="Search projects..."
            value={searchQuery}
            style={{
              width: "250px",
              borderRadius: "12px",
              fontSize: "18px",
            }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <MoreOptionsButton
          sx={{
            backgroundColor: "#E5E7EB",
            color: "#111827"}}
          onClick={() => alert("More options clicked!")} 
          />
          <AddProjectButton
            sx={{ backgroundColor: "#4F46E5" }}
            onClick={() => setIsModalOpen(true)}
          />
          {isModalOpen && <CreateProjectModal onClose={() => setIsModalOpen(false)} onProjectCreated={fetchProjects} />}
        </div>
      </div>
      <div style={styles.projectGrid}>
        {/* แสดง Popup */}
        <ConfirmationPopup
          open={isPopupOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this project? This action cannot be undone."
          onCancel={handleClosePopup}
          onConfirm={handleConfirmDelete}
        />
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              id={project.id}
              title={project.title}
              description={project.description}
              tasksCompleted={project.tasksCompleted}
              totalTasks={project.totalTasks}
              onEdit={handleEdit}
              onDelete={() => handleOpenPopup(project.id)}
            />
          ))
        ) : (
          <p>No projects available.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;