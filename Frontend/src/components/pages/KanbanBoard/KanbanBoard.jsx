import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import ActiveFilterChips from "./ActiveFilterChips";
import FilterButton from "./FilterButton";
import SearchInput from "./SearchInput";
import SettingsMenu from "./SettingMenu";
import RoleManagementModal from "./RoleManagementModal";
import { useRBAC } from "../../../context/RBAC";
import './KanbanBoard.css';

const Column = ({
  projectId,
  title,
  tasks,
  columnName,
  onDragStart,
  onDragOver,
  onDrop,
  onEditTask,
  onDeleteTask,
  onAddCard
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    setIsDragOver(false);
    onDrop(e, columnName);
  };

  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">{title}</div>
        <div className="task-count">{tasks.length}</div>
      </div>
      <div
        className={`column-content ${isDragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            projectId={projectId}
            task={task}
            onDragStart={onDragStart}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            isDone={columnName === "done"}
          />
        ))}
        <button className="add-card" onClick={() => onAddCard(columnName)}>
          + Add a card
        </button>
      </div>
    </div>
  );
};

const KanbanBoardView = ({
  projectId,
  tasks,
  onEditTask,
  onMoveTask,
  onAddCard,
  onDeleteTask
}) => {
  const todoTasks = tasks.filter(
    (task) => task.column_status === "todo" || task.column === "todo"
  );
  const inProgressTasks = tasks.filter(
    (task) => task.column_status === "inprogress" || task.column === "inprogress"
  );
  const reviewTasks = tasks.filter(
    (task) => task.column_status === "review" || task.column === "review"
  );
  const doneTasks = tasks.filter(
    (task) => task.column_status === "done" || task.column === "done"
  );

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnName) => {
    const taskId = e.dataTransfer.getData("taskId");
    onMoveTask(taskId, columnName);
  };

  return (
    <div className="board-container">
      <Column
        projectId={projectId}
        title="To Do"
        tasks={todoTasks}
        columnName="todo"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onAddCard={onAddCard}
      />
      <Column
        projectId={projectId}
        title="In Progress"
        tasks={inProgressTasks}
        columnName="inprogress"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onAddCard={onAddCard}
      />
      <Column
        projectId={projectId}
        title="Review"
        tasks={reviewTasks}
        columnName="review"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onAddCard={onAddCard}
      />
      <Column
        projectId={projectId}
        title="Done"
        tasks={doneTasks}
        columnName="done"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onAddCard={onAddCard}
      />
    </div>
  );
};

const KanbanBoard = () => {
  const { projectId } = useParams();
  const { canEditTask, canCreateTask, canMoveTask, canManageRoles } = useRBAC();
  const [showModal, setShowModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [modalMode, setModalMode] = useState("edit"); // "edit" หรือ "view"
  const [projectTitle, setProjectTitle] = useState("");
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  const [filters, setFilters] = useState({
    priority: [],
    assignees: [],
    dueDate: "all",
    status: []
  });
  const [showRoleManagement, setShowRoleManagement] = useState(false);

  useEffect(() => {
    let result = [...tasksData];

    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchTermLower) ||
          task.description?.toLowerCase().includes(searchTermLower)
      );
    }

    if (filters.priority.length > 0) {
      result = result.filter((task) => filters.priority.includes(task.priority));
    }

    if (filters.status.length > 0) {
      result = result.filter((task) => {
        const taskStatus = task.column || task.column_status || task.status;
        return filters.status.includes(taskStatus);
      });
    }

    if (filters.dueDate !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const oneWeekLater = new Date(today);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);

      result = result.filter((task) => {
        const dueDate = task.dueDate || task.due_date;
        if (!dueDate) return false;
        const taskDueDate = new Date(dueDate);
        switch (filters.dueDate) {
          case "overdue":
            return (
              taskDueDate < today &&
              task.column !== "done" &&
              task.column_status !== "done"
            );
          case "today":
            return taskDueDate >= today && taskDueDate < tomorrow;
          case "week":
            return taskDueDate >= today && taskDueDate <= oneWeekLater;
          case "future":
            return taskDueDate > oneWeekLater;
          default:
            return true;
        }
      });
    }

    if (filters.assignees.length > 0) {
      result = result.filter((task) => {
        if (task.assignees && Array.isArray(task.assignees)) {
          return task.assignees.some((assignee) =>
            filters.assignees.includes(assignee)
          );
        }
        if (task.assignee && typeof task.assignee === "string") {
          const taskAssignees = task.assignee.split(",").map((a) => a.trim());
          return taskAssignees.some((assignee) =>
            filters.assignees.includes(assignee)
          );
        }
        return false;
      });
    }

    setFilteredTasks(result);
  }, [tasksData, searchTerm, filters]);

  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/projects/${projectId}/tasks`
        );
        const formattedTasks = response.data.map((task) => ({
          ...task,
          column: task.status || task.column_status
        }));
        setTasksData(formattedTasks);
      } catch (err) {
        setError(err.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      axios
        .get(`${API_BASE_URL}/api/projects/${projectId}`)
        .then((response) => {
          if (response.data.success) {
            setProjectTitle(response.data.data.title);
          }
        })
        .catch((error) => {
          console.error("Error fetching project details:", error);
        });
    }
  }, [projectId, API_BASE_URL]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/tasks";
      if (projectId) {
        endpoint = `/api/projects/${projectId}/tasks`;
      }
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const formattedTasks = response.data.map((task) => ({
        ...task,
        column: task.column_status || task.status
      }));
      setTasksData(formattedTasks);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async (taskData) => {
    try {
      if (!projectId) {
        showNotification("Project ID is required", "error");
        return;
      }
      const apiPayload = {
        title: taskData.title,
        description: taskData.description || "",
        priority: taskData.priority || "low",
        status: taskData.column || "todo",
        due_date: taskData.dueDate,
        project_id: projectId,
        assignees: taskData.assignees
      };
      if (taskData.id) {
        await axios.put(`${API_BASE_URL}/api/tasks/${taskData.id}`, apiPayload);
        showNotification("Task updated successfully", "success");
      } else {
        await axios.post(`${API_BASE_URL}/api/tasks`, apiPayload);
        showNotification("Task created successfully", "success");
      }
      await fetchTasks();
      setShowModal(false);
    } catch (err) {
      showNotification(
        `Failed to save task: ${err.response?.data?.error || err.message}`,
        "error"
      );
    }
  };

  const moveTask = async (taskId, newColumn) => {
    // ตรวจสอบสิทธิ์ก่อนเลื่อน task
    if (!canMoveTask(projectId)) {
      showNotification("You do not have permission to move tasks", "error");
      return;
    }
    try {
      setTasksData((prevTasks) =>
        prevTasks.map((task) =>
          task.id === parseInt(taskId)
            ? {
                ...task,
                column: newColumn,
                column_status: newColumn,
                status: newColumn
              }
            : task
        )
      );
      await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/column`, {
        column: newColumn
      });
      showNotification("Task moved successfully", "success");
    } catch (err) {
      fetchTasks();
      showNotification(
        "Failed to move task: " + (err.response?.data?.error || err.message),
        "error"
      );
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      showNotification("Task deleted successfully", "success");
      fetchTasks();
    } catch (err) {
      showNotification(
        "Failed to delete task: " + (err.response?.data?.error || err.message),
        "error"
      );
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ open: true, message, type });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // เพิ่ม handleTaskClick เพื่อตรวจสอบสิทธิ์ในการแก้ไข task
  const handleTaskClick = (taskId) => {
    if (canEditTask(projectId)) {
      setModalMode("edit");
    } else {
      setModalMode("view");
    }
    setCurrentTaskId(taskId);
    setShowModal(true);
  };

  const addCard = (columnName) => {
    setSelectedColumn(columnName);
    setCurrentTaskId(null);
    // สำหรับผู้ใช้ที่ไม่มีสิทธิ์แก้ไขไม่ควรอนุญาตให้สร้าง task
    if (!canCreateTask(projectId)) {
      showNotification("You do not have permission to create tasks", "error");
      return;
    }
    setModalMode("edit");
    setShowModal(true);
  };

  const getTaskById = (taskId) => {
    return tasksData.find((task) => task.id === parseInt(taskId));
  };

  if (error && tasksData.length === 0) {
    return (
      <Box
        className="app"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Typography color="error">{error}</Typography>
        <button onClick={fetchTasks} style={{ marginLeft: "10px" }}>
          Try Again
        </button>
      </Box>
    );
  }

  if (loading && tasksData.length === 0) {
    return (
      <Box
        className="app"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="kanban-root">
      <header className="header">
        <div className="header-left">
          <h1>
            {projectId
              ? projectTitle
                ? `${projectTitle} Kanban Board`
                : "Loading..."
              : "My Kanban Board"}
          </h1>
        </div>
        <div className="header-right">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm("")}
          />
          <FilterButton filters={filters} onFilterChange={setFilters} />
          {canManageRoles(projectId) && (
            <SettingsMenu onOpenRoleManagement={() => setShowRoleManagement(true)} />
          )}
          {canCreateTask(projectId) && (
            <button
              onClick={() => {
                setCurrentTaskId(null);
                setSelectedColumn("todo");
                setModalMode("edit");
                setShowModal(true);
              }}
            >
              + Add New Task
            </button>
          )}
        </div>
      </header>

      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={(type, value) => {
          if (type === "all") {
            setFilters({ priority: [], assignees: [], dueDate: "all", status: [] });
          } else {
            setFilters((prev) => ({
              ...prev,
              [type]:
                type === "dueDate"
                  ? "all"
                  : prev[type].filter((item) => item !== value)
            }));
          }
        }}
      />

      <KanbanBoardView
        projectId={projectId} 
        tasks={filteredTasks}
        onEditTask={handleTaskClick}
        onMoveTask={moveTask}
        onAddCard={addCard}
        onDeleteTask={deleteTask}
      />

      {showModal && (
        <div className="kanban-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {currentTaskId ? "Edit Task" : "New Task"}
              </h3>
              <button
                className="close-modal"
                onClick={() => {
                  setShowModal(false);
                  setCurrentTaskId(null);
                }}
              >
                ×
              </button>
            </div>

            <TaskModal
              onClose={() => {
                setShowModal(false);
                setCurrentTaskId(null);
              }}
              onSave={saveTask}
              task={
                currentTaskId
                  ? getTaskById(currentTaskId)
                  : { column: selectedColumn, assignees: [] }
              }
              isEdit={modalMode === "edit"}
              projectId={projectId}
              modalMode={modalMode} // ส่ง prop นี้ไปให้ TaskModal เพื่อจัดการโหมด view-only ถ้าจำเป็น
            />

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setCurrentTaskId(null);
                }}
              >
                Cancel
              </button>
              {modalMode === "edit" && (
                <button
                  type="button"
                  className="update-btn"
                  onClick={() => {
                    const taskForm = document.getElementById("task-form");
                    if (taskForm) {
                      const submitEvent = new Event("submit", {
                        cancelable: true,
                        bubbles: true
                      });
                      taskForm.dispatchEvent(submitEvent);
                    }
                  }}
                >
                  {currentTaskId ? "Update" : "Create"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <RoleManagementModal
        open={showRoleManagement}
        onClose={() => setShowRoleManagement(false)}
        projectId={projectId}
        API_BASE_URL={API_BASE_URL}
      />
    </Box>
  );
};

export default KanbanBoard;
