import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button as MuiButton,
  Snackbar,
  Alert,
  CircularProgress  // Make sure this is included
} from "@mui/material";
import axios from "axios";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

// CSS Styles as a string variable for injection
const styles = `
:root {
  --primary-color: #4a6fa5;
  --column-bg: #f5f7fa;
  --card-bg: #ffffff;
  --border-color: #e1e5eb;
  --shadow: 0 2px 5px rgba(0,0,0,0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

body {
  background-color: #ebeff5;
  color: #333;
  padding: 20px;
}

.app {
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #3a5985;
}

.board-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  min-height: calc(100vh - 120px);
}

.column {
  background-color: var(--column-bg);
  border-radius: 6px;
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

.task-count {
  background-color: #e1e5eb;
  color: #636e7b;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.column-content {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  transition: background-color 0.3s;
}

.column-content.drag-over {
  background-color: rgba(74, 111, 165, 0.1);
}

.add-card {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: transparent;
  color: #636e7b;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  text-align: left;
}

.add-card:hover {
  background-color: rgba(74, 111, 165, 0.1);
}

.kanban-card {
  background-color: var(--card-bg);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.kanban-card:active {
  cursor: grabbing;
}

.card-title {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 15px;
}

.card-description {
  font-size: 13px;
  color: #636e7b;
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.card-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.label {
  height: 6px;
  width: 32px;
  border-radius: 3px;
}

.label.high {
  background-color: #e74c3c;
}

.label.medium {
  background-color: #f39c12;
}

.label.low {
  background-color: #27ae60;
}

.due-date {
  color: #636e7b;
}

.overdue {
  color: #e74c3c;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #dfe4ea;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #636e7b;
  font-weight: 600;
  font-size: 10px;
}

.edit-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.kanban-card:hover .edit-btn {
  opacity: 0.7;
}

.edit-btn:hover {
  opacity: 1 !important;
  background: none;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
}

.close-modal {
  background: none;
  border: none;
  color: #636e7b;
  cursor: pointer;
  font-size: 20px;
}

.close-modal:hover {
  background: none;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #2c3e50;
}

input, textarea, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #e1e5eb;
  color: #636e7b;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}

.card-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 999;
}

.kanban-card:hover .card-actions {
  opacity: 0.7;
}
  
.btn {
  background: none;
  border: none;
  cursor: pointer;
  /* กำหนดขนาดหากจำเป็น */
  width: 30px;
  height: 30px;
  /* ...สไตล์อื่นๆ... */
}

.card-actions .btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #636e7b;
  border-radius: 3px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.card-actions .btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #2c3e50;
}

.card-actions .delete-btn {
  color: #e74c3c;
}

.card-actions .delete-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
  color: #c0392b;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 2px;
}

.edit-btn:hover, .delete-btn:hover {
  opacity: 1;
}

.delete-btn {
  color: #e74c3c;
}

.delete-btn:hover {
  color: #c0392b;
}
`;

const TaskCard = ({ task, onDragStart, onEditTask, onDeleteTask, isDone }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) return '';

    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (isDone) return false;
    
    const dueDate = task.dueDate || task.due_date;
    if (!dueDate) return false;

    return new Date(dueDate) < new Date();
  };

  // Determine the due date value
  const dueDateValue = task.dueDate || task.due_date;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  };
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      data-id={task.id}
    >
      <div className="card-actions">
        <button
          className="btn edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEditTask(task.id);
          }}
        >
          ✏️
        </button>
        <button
          className="btn delete-btn"
          onClick={(e) => {handleDelete}}
        >
          🗑️
        </button>
      </div>
      <div className="card-labels">
        <div className={`label ${task.priority}`}></div>
      </div>
      <div className="card-title">{task.title}</div>
      <div className="card-description">{task.description}</div>
      <div className="card-meta">
        <div className={`due-date ${isOverdue() ? 'overdue' : ''}`}>
          {dueDateValue 
            ? (isDone ? 'Completed: ' : 'Due: ') + formatDate(dueDateValue)
            : 'No due date'}
        </div>
        <div className="avatar">{task.assignee || 'NA'}</div>
      </div>
    </div>
  );
};

// Column Component - remains mostly the same
const Column = ({
  title,
  tasks,
  columnName,
  onDragStart,
  onDragOver,
  onDrop,
  onEditTask,
  onDeleteTask, // เพิ่ม prop นี้
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
        className={`column-content ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask} // ส่ง onDeleteTask เข้าไปที่ TaskCard
            isDone={columnName === 'done'}
          />
        ))}
        <button className="add-card" onClick={() => onAddCard(columnName)}>
          + Add a card
        </button>
      </div>
    </div>
  );
};


// TaskModal Component - updated to include project_id
// TaskModal Component - updated to include project_id and task id when editing
const TaskModal = ({ onClose, onSave, task, isEdit, projectId }) => {
  const [formData, setFormData] = useState({
    // เพิ่ม id ในกรณีที่มี task (สำหรับ edit)
    id: task?.id || null,
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    assignee: '',
    column: 'todo',
    project_id: projectId || ''
  });

  // Set initial form data if editing a task
  useEffect(() => {
    if (isEdit && task) {
      let dateOnly = '';
      if (typeof task.due_date === 'string') {
        // ถ้า task.due_date เป็น string ที่เก็บแบบ "YYYY-MM-DD" อยู่แล้ว
        dateOnly = task.due_date;
      } else if (task.due_date) {
        dateOnly = new Date(task.due_date).toISOString().split('T')[0];
      }
      setFormData({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        dueDate: dateOnly, // ควรจะได้ "YYYY-MM-DD"
        assignee: task.assignee || '',
        column: task.column || 'todo',
        project_id: projectId || task.project_id || ''
      });
    }
  }, [isEdit, task, projectId]);
  

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace('task-', '')]: value
    });
  };
  

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Task' : 'Add New Task'}</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <form id="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              type="text"
              id="task-title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="task-dueDate">Due Date</label>
            <input
              type="date"
              id="task-dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-assignee">Assignee</label>
            <input
              type="text"
              id="task-assignee"
              placeholder="Enter initials"
              value={formData.assignee}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-column">Column</label>
            <select
              id="task-column"
              value={formData.column}
              onChange={handleChange}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          {/* Hidden field for project_id */}
          <input
            type="hidden"
            id="task-project_id"
            value={formData.project_id}
          />
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit">{isEdit ? 'Update Task' : 'Save Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// KanbanBoardView Component - remains mostly the same
const KanbanBoardView = ({ tasks, onEditTask, onMoveTask, onAddCard, onDeleteTask }) => {
  // Group tasks by column
  const todoTasks = tasks.filter(task => task.column_status === 'todo' || task.column === 'todo');
  const inProgressTasks = tasks.filter(task => task.column_status === 'inprogress' || task.column === 'inprogress');
  const reviewTasks = tasks.filter(task => task.column_status === 'review' || task.column === 'review');
  const doneTasks = tasks.filter(task => task.column_status === 'done' || task.column === 'done');

  // Handle drag start
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e, columnName) => {
    const taskId = e.dataTransfer.getData('taskId');
    onMoveTask(taskId, columnName);
  };

  return (
    <div className="board-container">
      <Column
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


// Main KanbanBoard Component - updated with API integration
const KanbanBoard = () => {
  const { projectId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState('todo');
  const [projectTitle, setProjectTitle] = useState("");
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  // Fetch tasks from the API when component mounts
  useEffect(() => {
    console.log("Received projectId:", projectId);

    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/tasks`);
        console.log("Fetched tasks:", response.data);

        const formattedTasks = response.data.map(task => ({
          ...task,
          column: task.status || task.column_status
        }));

        setTasksData(formattedTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  // Fetch project details to get project title
  axios.get(`${API_BASE_URL}/api/projects/${projectId}`)
    .then(response => {
      if (response.data.success) {
        // title จริงอยู่ใน response.data.data.title
        setProjectTitle(response.data.data.title);
      } else {
        console.error("API returned success=false:", response.data.error);
      }
    })
    .catch(error => {
      console.error("Error fetching project details:", error);
    });


  // Fetch all tasks or project-specific tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/tasks';

      if (projectId) {
        endpoint = `/api/projects/${projectId}/tasks`;
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const formattedTasks = response.data.map(task => ({
        ...task,
        column: task.column_status
      }));

      setTasksData(formattedTasks);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add or update a task
  const saveTask = async (taskData) => {
    try {
      if (!projectId) {
        showNotification('Project ID is required', 'error');
        return;
      }
  
      const apiPayload = {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'low',
        status: taskData.column || 'todo',
        due_date: taskData.dueDate,
        project_id: projectId,
        assignee: taskData.assignee || ''
      };
  
      if (taskData.id) {
        // Editing task ใช้ PUT method สำหรับ update task
        console.log('Updating task with payload:', apiPayload);
        await axios.put(`${API_BASE_URL}/api/tasks/${taskData.id}`, apiPayload);
        showNotification('Task updated successfully', 'success');
      } else {
        // Creating new task ใช้ POST method
        console.log('Creating task with payload:', apiPayload);
        await axios.post(`${API_BASE_URL}/api/tasks`, apiPayload);
        showNotification('Task created successfully', 'success');
      }
  
      // Refresh tasks หลังจาก save task
      const tasksResponse = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/tasks`);
      const formattedTasks = tasksResponse.data.map(task => ({
        ...task,
        column: task.status || task.column_status || 'todo'
      }));
  
      setTasksData(formattedTasks);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving task:', err);
      showNotification(
        `Failed to save task: ${err.response?.data?.error || err.message}`,
        'error'
      );
    }
  };
  
  

  useEffect(() => {
    if (!projectId) {
      console.error('No project ID provided');
      return;
    }
  }, [projectId]);

  if (!projectId) {
    return (
      <Box className="app" sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Typography color="error">
          No Project Selected. Please select a project from the dashboard.
        </Typography>
      </Box>
    );
  }

  // Move a task to a different column
  const moveTask = async (taskId, newColumn) => {
    try {
      // อัปเดต State ใน React ก่อน (Optimistic UI)
      setTasksData(prevTasks =>
        prevTasks.map(task =>
          task.id === parseInt(taskId)
            ? { ...task, column: newColumn, column_status: newColumn }
            : task
        )
      );
  
      // เรียก API เพื่ออัปเดตใน DB
      await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/column`, { column: newColumn });
      showNotification('Task moved successfully', 'success');
  
      // ถ้าต้องการให้แน่ใจว่า sync กับ DB ก็ fetchTasks อีกรอบ (หรือไม่ก็ได้ ถ้าเชื่อว่า optimistic UI พอ)
      // await fetchTasks();
    } catch (err) {
      console.error('Error moving task:', err);
      fetchTasks(); // fallback ดึงข้อมูลล่าสุดจาก DB
      showNotification('Failed to move task: ' + (err.response?.data?.error || err.message), 'error');
    }
  };
  

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      showNotification('Task deleted successfully', 'success');
      fetchTasks(); // Refresh tasks หลังจากลบ
    } catch (err) {
      console.error('Error deleting task:', err);
      showNotification('Failed to delete task: ' + (err.response?.data?.error || err.message), 'error');
    }
  };
  

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Open edit modal with task data
  const editTask = (taskId) => {
    setCurrentTaskId(taskId);
    setShowModal(true);
  };

  // Open add card modal for a specific column
  const addCard = (columnName) => {
    setSelectedColumn(columnName);
    setCurrentTaskId(null);
    setShowModal(true);
  };

  // Find task by ID
  const getTaskById = (taskId) => {
    return tasksData.find(task => task.id === parseInt(taskId));
  };

  if (error && tasksData.length === 0) {
    return (
      <Box className="app" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="error">{error}</Typography>
        <button onClick={fetchTasks} style={{ marginLeft: '10px' }}>Try Again</button>
      </Box>
    );
  }

  return (
    <Box className="app">
      <style>{styles}</style>

      <header className="header">
        <h1>
          {projectId
            ? (projectTitle ? `${projectTitle} Kanban Board` : "Loading...")
            : "My Kanban Board"
          }
        </h1>
        <div className="header-buttons">
          <button onClick={() => {
            setCurrentTaskId(null);
            setSelectedColumn('todo');
            setShowModal(true);
          }}>+ Add New Task</button>
        </div>
      </header>

      <KanbanBoardView
        tasks={tasksData}
        onEditTask={editTask}
        onMoveTask={moveTask}
        onAddCard={addCard}
      />

      {showModal && (
        <TaskModal
          onClose={() => {
            setShowModal(false);
            setCurrentTaskId(null);
          }}
          onSave={saveTask}
          task={currentTaskId ? getTaskById(currentTaskId) : { column: selectedColumn }}
          isEdit={!!currentTaskId}
          projectId={projectId}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanBoard;