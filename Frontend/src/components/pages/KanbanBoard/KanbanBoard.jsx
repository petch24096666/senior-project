import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Button 
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
import TaskArchiveModal from './TaskArchiveModal';
import { useContext } from 'react';
import { UserContext } from '../../../context/Usercontext';

// API service to centralize API calls
const TaskService = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081",

  async fetchTasks(projectId) {
    const endpoint = projectId ? `/api/projects/${projectId}/tasks` : "/api/tasks";
    const response = await axios.get(`${this.API_BASE_URL}${endpoint}`);
    return response.data;
  },

  async fetchProject(projectId) {
    const response = await axios.get(`${this.API_BASE_URL}/api/projects/${projectId}`);
    return response.data;
  },

  async saveTask(taskData, projectId) {
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
      return await axios.put(`${this.API_BASE_URL}/api/tasks/${taskData.id}`, apiPayload);
    } else {
      return await axios.post(`${this.API_BASE_URL}/api/tasks`, apiPayload);
    }
  },

  async moveTask(taskId, newColumn) {
    return await axios.patch(`${this.API_BASE_URL}/api/tasks/${taskId}/column`, { 
      column: newColumn, 
      status: newColumn 
    });
  },

  async updateProjectStatus(projectId) {
    return await axios.patch(`${this.API_BASE_URL}/api/projects/${projectId}/update-status`);
  },

  async deleteTask(taskId) {
    return await axios.delete(`${this.API_BASE_URL}/api/tasks/${taskId}`);
  }
};

// Column component normalized
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

// Normalized KanbanBoardView with consistent task status handling
const KanbanBoardView = ({
  projectId,
  tasks,
  onEditTask,
  onMoveTask,
  onAddCard,
  onDeleteTask
}) => {
  // Unified status check function to handle inconsistent data structure
  const getTaskStatus = (task) => task.column_status || task.column || task.status || "todo";

  // Filter tasks with normalized status check
  const todoTasks = tasks.filter(task => 
    getTaskStatus(task) === "todo" && !task.deleted_at
  );
  
  const inProgressTasks = tasks.filter(task => 
    getTaskStatus(task) === "inprogress" && !task.deleted_at
  );
  
  const reviewTasks = tasks.filter(task => 
    getTaskStatus(task) === "review" && !task.deleted_at
  );
  
  const doneTasks = tasks.filter(task => 
    getTaskStatus(task) === "done" && !task.deleted_at
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

// Main KanbanBoard component
const KanbanBoard = () => {
  const { projectId } = useParams();
  const { canEditTask, canCreateTask, canMoveTask, canManageRoles,canViewArchiveTask} = useRBAC();
  const { customUser } = useContext(UserContext);
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showTaskArchiveModal, setShowTaskArchiveModal] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  
  // Task states
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [modalMode, setModalMode] = useState("edit");
  
  // Data states
  const [projectTitle, setProjectTitle] = useState("");
  const [tasksData, setTasksData] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priority: [],
    assignees: [],
    dueDate: "all",
    status: []
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const tasks = await TaskService.fetchTasks(projectId);
      
      // Normalize task data structure 
      const formattedTasks = tasks.map(task => ({
        ...task,
        // Ensure consistent column property
        column: task.column_status || task.status || task.column || "todo"
      }));
      
      setTasksData(formattedTasks);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please try again later.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch project data
  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await TaskService.fetchProject(projectId);
      if (response.success) {
        setProjectTitle(response.data.title);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  }, [projectId]);

  // Initial data loading
  useEffect(() => {
    fetchTasks();
    fetchProjectData();
  }, [fetchTasks, fetchProjectData]);

  // Apply filters to tasks
  useEffect(() => {
    let result = [...tasksData];

    // Search filter
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchTermLower) ||
          task.description?.toLowerCase().includes(searchTermLower)
      );
    }

    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter((task) => filters.priority.includes(task.priority));
    }

    // Status filter with normalized status check
    if (filters.status.length > 0) {
      result = result.filter((task) => {
        const taskStatus = task.column_status || task.column || task.status;
        return filters.status.includes(taskStatus);
      });
    }

    // Due date filter
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
        const taskStatus = task.column_status || task.column || task.status;
        
        switch (filters.dueDate) {
          case "overdue":
            return taskDueDate < today && taskStatus !== "done";
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

    // Assignee filter
    if (filters.assignees.length > 0) {
      result = result.filter((task) => {
        // Handle different assignee data structures
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

  // Notification display
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ open: true, message, type });
  }, []);

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Task operations
  const saveTask = async (taskData) => {
    try {
      if (!projectId) {
        showNotification("Project ID is required", "error");
        return;
      }
      
      await TaskService.saveTask(taskData, projectId);
      
      showNotification(
        taskData.id ? "Task updated successfully" : "Task created successfully", 
        "success"
      );
      
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
    if (!canMoveTask(projectId)) {
      showNotification("You do not have permission to move tasks", "error");
      return;
    }
    
    try {
      // Optimistic update
      setTasksData(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: newColumn, column_status: newColumn, column: newColumn }
            : task
        )
      );
      
      // Update task status
      await TaskService.moveTask(taskId, newColumn);
      
      // Update project status
      await TaskService.updateProjectStatus(projectId);
      
      // Fetch updated project
      await fetchProjectData();
      
      showNotification("Task moved successfully", "success");
    } catch (err) {
      // Revert on error
      fetchTasks();
      showNotification(
        "Failed to move task: " + (err.response?.data?.error || err.message),
        "error"
      );
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await TaskService.deleteTask(taskId);
      showNotification("Task deleted successfully", "success");
      fetchTasks();
    } catch (err) {
      showNotification(
        "Failed to delete task: " + (err.response?.data?.error || err.message),
        "error"
      );
    }
  };

  // UI handlers
  const handleTaskClick = (taskId) => {
    setModalMode(canEditTask(projectId) ? "edit" : "view");
    setCurrentTaskId(taskId);
    setShowModal(true);
  };

  const addCard = (columnName) => {
    if (!canCreateTask(projectId)) {
      showNotification("You do not have permission to create tasks", "error");
      return;
    }
    
    setSelectedColumn(columnName);
    setCurrentTaskId(null);
    setModalMode("edit");
    setShowModal(true);
  };

  const getTaskById = (taskId) => {
    return tasksData.find((task) => task.id === taskId);
  };

  const handleTaskRestored = () => {
    fetchTasks();
  };

  const handleClearAllFilters = () => {
    setFilters({ priority: [], assignees: [], dueDate: "all", status: [] });
  };

  const handleRemoveFilter = (type, value) => {
    if (type === "all") {
      handleClearAllFilters();
    } else {
      setFilters((prev) => ({
        ...prev,
        [type]:
          type === "dueDate"
            ? "all"
            : prev[type].filter((item) => item !== value)
      }));
    }
  };

  // Error state
  if (error && tasksData.length === 0) {
    return (
      <Box
        className="app"
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchTasks} 
          sx={{ marginLeft: "10px" }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // Loading state
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
      {/* Header Section */}
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
  
  <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <SearchInput
      value={searchTerm}
      onChange={setSearchTerm}
      onClear={() => setSearchTerm("")}
    />
    {canViewArchiveTask(projectId) && (
    <Button
      variant="contained"
      size="small"
      onClick={() => setShowTaskArchiveModal(true)}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.8rem',
        backgroundColor: '#5e4cd7',
        color: 'white',
        '&:hover': {
          backgroundColor: '#4e3fc5',
        },
        borderRadius: '4px',
        padding: '6px 12px',
        boxShadow: 'none'
      }}
    >
      View Archived Tasks
    </Button>
    )}
    <FilterButton 
      filters={filters} 
      onFilterChange={setFilters} 
    />
    {canManageRoles(projectId) && (
      <SettingsMenu onOpenRoleManagement={() => setShowRoleManagement(true)} />
    )}
    
    {canCreateTask(projectId) && (
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          setCurrentTaskId(null);
          setSelectedColumn("todo");
          setModalMode("edit");
          setShowModal(true);
        }}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8rem',
          backgroundColor: '#5e4cd7',
          color: 'white',
          '&:hover': {
            backgroundColor: '#4e3fc5',
          },
          borderRadius: '4px',
          padding: '6px 12px',
          boxShadow: 'none'
        }}
      >
        + Add New Task
      </Button>
    )}
  </div>
</header>

      {/* Active Filters */}
      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
      />

      {/* Kanban Board */}
      <KanbanBoardView
        projectId={projectId} 
        tasks={filteredTasks}
        onEditTask={handleTaskClick}
        onMoveTask={moveTask}
        onAddCard={addCard}
        onDeleteTask={deleteTask}
      />

      {/* Task Modal */}
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
              modalMode={modalMode}
              currentUser={customUser}
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

      {/* Archive Modal */}
      {showTaskArchiveModal && (
        <TaskArchiveModal
          open={showTaskArchiveModal}
          onClose={() => setShowTaskArchiveModal(false)}
          projectId={projectId}
          onTaskRestored={handleTaskRestored}
        />
      )}

      {/* Role Management Modal */}
      <RoleManagementModal
        open={showRoleManagement}
        onClose={() => setShowRoleManagement(false)}
        projectId={projectId}
        API_BASE_URL={TaskService.API_BASE_URL}
      />

      {/* Notifications */}
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
    </Box>
  );
};

export default KanbanBoard;