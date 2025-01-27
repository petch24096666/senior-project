import React, { useEffect, useState } from "react";
import axios from "axios";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { MoreOptionsButton, AddProjectButton } from "../../common/button"
import SearchBar from "../../common/searchbar";
import CreateProjectModal from "./AddProject";

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
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    backgroundColor: "#4F46E5",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    color: "#111827",
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    columnGap: "24px",
    rowGap: "32px",
  },
  cardContainer: {
    width: "262px",
    height: "223px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "25px",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  cardHeader: {
    fontFamily: "Inter, sans-serif",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "29.05px",
    color: "#111827",
  },
  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  taskLabel: {
    fontFamily: "Inter, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "16px",
    color: "#6B7280",
  },
  taskIcon: {
    fontSize: "16px",
    color: "#6366F1",
  },
  cardTaskNumber: {
    fontFamily: "Inter, sans-serif",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "29.05px",
    color: "#111827",
    marginTop: "8px",
  },
  progressBarContainer: {
    width: "100%",
    height: "6px",
    backgroundColor: "#E5E7EB",
    borderRadius: "3px",
    overflow: "hidden",
    marginTop: "10px",
  },
  progressBar: (progress) => ({
    width: `${progress}%`,
    height: "100%",
    backgroundColor: "#6366F1",
  }),
  cardDescription: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    color: "#6B7280",
    marginTop: "10px",
    marginBottom: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,  // แสดงสูงสุด 3 บรรทัด
    WebkitBoxOrient: "vertical",
  }
};



const ProjectCard = ({ title, description, tasksCompleted, totalTasks }) => {
  const progress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

  return (
    <div style={styles.cardContainer}>
      <h3 style={styles.cardHeader}>{title || "Untitled Project"}</h3>

      <p style={styles.cardDescription}>
        {description || "No description available"}
      </p>

      <div style={styles.taskRow}>
        <span style={styles.taskLabel}>Tasks</span>
        <span style={styles.taskIcon}>
          <PlaylistAddCheckIcon />
        </span>
      </div>

      <div>
        <span style={styles.cardTaskNumber}>
          {`${tasksCompleted || 0}/${totalTasks || 0}`}
        </span>
      </div>

      <div style={styles.progressBarContainer}>
        <div style={styles.progressBar(progress)}></div>
      </div>
    </div>
  );
};


const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // เพิ่ม state สำหรับเก็บค่าค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects");
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
          <MoreOptionsButton onClick={() => alert("More options clicked!")} />
          <AddProjectButton onClick={() => setIsModalOpen(true)} />
          {isModalOpen && <CreateProjectModal onClose={() => setIsModalOpen(false)} onProjectCreated={fetchProjects} />}
        </div>
      </div>
      <div style={styles.projectGrid}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              tasksCompleted={project.tasksCompleted}
              totalTasks={project.totalTasks}
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