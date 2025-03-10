import React, { useEffect, useState } from "react";
import { MoreOptionsButton, AddProjectButton } from "../../common/button"
import SearchBar from "../../common/searchbar";
import AddTasktModal from "./AddTask";
import { fontWeight, margin, width } from "@mui/system";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";


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
const Task = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // เพิ่ม state สำหรับเก็บค่าค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // เก็บ ID ของโปรเจ็กต์ที่เลือก
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  
  const initialData = {
    columns: {
      "to-do": {
        title: "To Do",
        tasks: [
          {
            id: "1",
            category: "Design",
            title: "Redesign homepage layout",
            description: "Update the homepage design to match new brand guidelines",
            dueDate: "Mar 10, 2025",
            comments: 3,
            users: ["👩🏻", "👨‍💻"]
          },
          {
            id: "2",
            category: "Research",
            title: "User interview sessions",
            description: "Conduct user interviews for new feature",
            dueDate: "Mar 10, 2025",
            comments: 2,
            users: ["👩🏻"]
          }
        ]
      },
      "in-progress": {
        title: "In Progress",
        tasks: [
          {
            id: "3",
            category: "Development",
            title: "API Integration",
            description: "Integrate payment gateway API",
            dueDate: "Mar 10, 2025",
            comments: 5,
            users: ["🧑🏽‍💻"]
          }
        ]
      },
      "review": {
        title: "Review",
        tasks: [
          {
            id: "4",
            category: "QA",
            title: "Bug testing",
            description: "Test new features and fix bugs",
            dueDate: "Mar 10, 2025",
            comments: 1,
            users: ["👨🏻‍🎨"]
          }
        ]
      },
      "done": {
        title: "Done",
        tasks: [
          {
            id: "5",
            category: "Development",
            title: "User authentication",
            description: "Implement user login and registration",
            dueDate: "Mar 10, 2025",
            comments: 0,
            users: ["👩🏼‍💻"]
          }
        ]
      }
    }
  };
  
  const [data, setData] = useState(initialData);
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // ถ้าปลายทางไม่ถูกต้อง ให้ return

    const sourceColumn = data.columns[source.droppableId];
    const destColumn = data.columns[destination.droppableId];
    if (!sourceColumn || !destColumn) return;

    const sourceTasks = Array.from(sourceColumn.tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // ย้ายตำแหน่งภายในคอลัมน์เดิม
      sourceTasks.splice(destination.index, 0, movedTask);
      setData({ ...data, columns: { ...data.columns, [source.droppableId]: { ...sourceColumn, tasks: sourceTasks } } });
    } else {
      // ย้ายไปคอลัมน์ใหม่
      const destTasks = Array.from(destColumn.tasks);
      destTasks.splice(destination.index, 0, movedTask);

      setData({
        ...data,
        columns: {
          ...data.columns,
          [source.droppableId]: { ...sourceColumn, tasks: sourceTasks },
          [destination.droppableId]: { ...destColumn, tasks: destTasks }
        }
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
          <h1 style={styles.header}>Projects/Website Redesign Project</h1>
          <p style={styles.description}>
            Manage tasks and monitor progress efficiently.
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
      <div style={{ padding: "20px", maxWidth: "95vw", margin: "auto", overflowX: "auto" }}>
      <DragDropContext onDragEnd={onDragEnd}>
  <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "flex-start" }}>
    {Object.entries(data.columns).map(([columnId, column]) => (
      <Droppable key={columnId} droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              background: snapshot.isDraggingOver ? "#E3E8EF" : "#F8F9FA",
              padding: "15px",
              borderRadius: "8px",
              minWidth: "280px",
              minHeight: "200px",
              flex: "1",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background 0.3s ease"
            }}
          >
            <h2 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>{column.title}</h2>
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      background: snapshot.isDragging ? "#ffffff" : "#ffffff",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      boxShadow: snapshot.isDragging
                        ? "0px 10px 15px rgba(0, 0, 0, 0.2)"
                        : "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s ease",
                      transform: snapshot.isDragging ? "scale(1.05)" : "scale(1)",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        background: "#EDEFF3",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {task.category}
                      </span>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{task.dueDate}</span>
                    </div>
                    <h3 style={{ fontSize: "16px", margin: "10px 0", fontWeight: "bold" }}>{task.title}</h3>
                    <p style={{ fontSize: "14px", color: "#6B7280" }}>{task.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                      <div>{task.users.map((user, i) => <span key={i} style={{ marginRight: "5px" }}>{user}</span>)}</div>
                      <span style={{ fontSize: "14px", color: "#6B7280" }}>💬 {task.comments}</span>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ))}
  </div>
</DragDropContext>
    </div>
    </div>
  );
};
export default Task;
