import React, { useEffect, useState } from "react";
import { MoreOptionsButton, AddProjectButton } from "../../common/button"
import SearchBar from "../../common/searchbar";
import AddTasktModal from "./AddTask";
import { fontWeight, margin, width } from "@mui/system";

const styles = {
  projectList: {
    padding: "32px 22px",
    maxWidth: "calc(100% - 44px)",
    margin: "0 auto",
    zoom: "0.85"
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
  searchBox: {
    width: "384px",
    height:"42px",

    padding: "5px 20px",
    fontSize: "16px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    outline: "none",
    color: "#6B7280",
    fontFamily: "Inter, sans-serif",
  },
  addTask: {
    fontFamily: "system-ui",
    width: "135px",
    height: "43px",
    color: "#FFFFFF",
    padding: "10px 12px 10px 12px",
    gap: "13px",
    borderRadius: "8px",
    background: "#4F46E5",
    border: "1px solid #E5E7EB",
    display: "flex",
    cursor: "pointer",
  },
  plusIcon: {
    fontSize: "27px",
    marginTop: "-11px" 
  },
  textAdd: {
    fontSize: "17px",
    marginTop: "-2px" 
  },
  optionsButton: {
    width: "50px",
    height: "35px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    display: "flex",
    cursor: "pointer",
  },
  dotText: {
    fontFamily: "system-ui",
    fontWeight: "bold",
    fontSize: "23px",
    marginTop: "-5px",
    marginLeft: "8.5px"
  },  
};

const KanbanBoard = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // เพิ่ม state สำหรับเก็บค่าค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // เก็บ ID ของโปรเจ็กต์ที่เลือก
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const addtaskNavigate = () => {
    navigate("task/addtask"); // เปลี่ยนเส้นทางไปที่ /add-task
  };

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
          <input
            style={styles.searchBox}
            type="search"
            placeholder="Search..."
          />
          <button style={styles.optionsButton}>
            <span style={styles.dotText}>...</span>
          </button>
          <button style={styles.addTask} onClick={() => setIsModalOpen(true)}>
            <span style={styles.plusIcon}>+</span>
            <span style={styles.textAdd}>Add Task</span>
          </button>
          {isModalOpen && <AddTasktModal onClose={() => setIsModalOpen(false)} onProjectCreated={fetchProjects} />}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
