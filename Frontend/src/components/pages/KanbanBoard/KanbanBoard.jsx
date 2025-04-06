import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button as MuiButton,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import AssigneeDropdown from './AssigneeDropdown';

// CSS Styles as a string variable for injection
const styles = `
.kanban-root {
  --primary-color: #4a6fa5;
  --column-bg: #f5f7fa;
  --card-bg: #ffffff;
  --border-color: #e1e5eb;
  --shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.kanban-root * {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.kanban-root .app {
  min-height: 100vh;
}

.kanban-root .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.kanban-root h1 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.kanban-root .header-buttons {
  display: flex;
  gap: 10px;
}

.kanban-root button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 0;
}

.kanban-root button:hover {
  background-color: #3a5985;
}

.kanban-root .board-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  min-height: calc(100vh - 120px);
}

.kanban-root .column {
  background-color: var(--column-bg);
  border-radius: 6px;
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.kanban-root .column-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban-root .column-title {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

.kanban-root .task-count {
  background-color: #e1e5eb;
  color: #636e7b;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.kanban-root .column-content {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  transition: background-color 0.3s;
}

.kanban-root .column-content.drag-over {
  background-color: rgba(74, 111, 165, 0.1);
}

.kanban-root .add-card {
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

.kanban-root .add-card:hover {
  background-color: rgba(74, 111, 165, 0.1);
}

.kanban-root .kanban-card {
  background-color: var(--card-bg);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  margin: 0 0 12px 0;
}

.kanban-root .kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.kanban-root .card-title {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 15px;
}

.kanban-root .card-description {
  font-size: 13px;
  color: #636e7b;
  margin-bottom: 12px;
}

.kanban-root .card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.kanban-root .card-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.kanban-root .label {
  height: 6px;
  width: 32px;
  border-radius: 3px;
}

.kanban-root .label.high {
  background-color: #e74c3c;
}

.kanban-root .label.medium {
  background-color: #f39c12;
}

.kanban-root .label.low {
  background-color: #27ae60;
}

.kanban-root .due-date {
  color: #636e7b;
}

.kanban-root .overdue {
  color: #e74c3c;
}

.kanban-root .avatar {
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

.kanban-root .card-actions {
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

.kanban-root .kanban-card:hover .card-actions {
  opacity: 0.7;
}
  
.kanban-root .btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
}

.kanban-root .card-actions .btn {
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

.kanban-root .card-actions .btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #2c3e50;
}

.kanban-root .card-actions .delete-btn {
  color: #e74c3c;
}

.kanban-root .card-actions .delete-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
  color: #c0392b;
}

.kanban-root .delete-btn {
  color: #e74c3c;
}

.kanban-root .delete-btn:hover {
  color: #c0392b;
}

/* Modal Styles */
.kanban-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(9, 30, 66, 0.54);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 50px;
  overflow-y: auto;
}

.kanban-modal .modal-content {
  background-color: white;
  border-radius: 3px;
  width: 800px;
  max-width: 95%;
  box-shadow: 0px 8px 16px rgba(9, 30, 66, 0.25);
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: calc(100vh - 100px);
  overflow: hidden;
  padding-bottom: 64px; /* Add space for the action buttons */
}

.kanban-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e1e5eb;
}

.kanban-modal .modal-title {
  font-size: 20px;
  font-weight: 500;
  color: #172b4d;
  margin: 0;
}

.kanban-modal .close-modal {
  background: none;
  border: none;
  color: #6b778c;
  cursor: pointer;
  font-size: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 0;
  margin: 0;
}

.kanban-modal .close-modal:hover {
  background-color: rgba(9, 30, 66, 0.08);
  color: #172b4d;
}

.kanban-modal .modal-body {
  padding: 0;
  display: flex;
  overflow: auto;
  max-height: calc(100vh - 180px);
}

.kanban-modal .modal-main {
  flex: 2;
  padding: 24px;
  overflow-y: auto;
}

.kanban-modal .modal-sidebar {
  flex: 1;
  background-color: #f4f5f7;
  padding: 24px;
  border-left: 1px solid #e1e5eb;
  overflow-y: auto;
}

.kanban-modal .modal-section {
  margin-bottom: 24px;
}

.kanban-modal .modal-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b778c;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.kanban-modal .modal-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e1e5eb;
  background-color: #f4f5f7;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 5;
}

@media (max-width: 768px) {
  .kanban-modal .modal-body {
    flex-direction: column;
  }
  
  .kanban-modal .modal-sidebar {
    border-left: none;
    border-top: 1px solid #e1e5eb;
  }
}

.kanban-modal .form-group {
  margin-bottom: 20px;
}

.kanban-modal label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #5E6C84;
  font-weight: 500;
}

.kanban-modal input, 
.kanban-modal textarea, 
.kanban-modal select {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #DFE1E6;
  border-radius: 3px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #FAFBFC;
}

.kanban-modal input:focus, 
.kanban-modal textarea:focus, 
.kanban-modal select:focus {
  border-color: #4C9AFF;
  box-shadow: 0 0 0 1px #4C9AFF;
  outline: none;
}

.kanban-modal input::placeholder, 
.kanban-modal textarea::placeholder {
  color: #B3BAC5;
}

.kanban-modal textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.kanban-modal select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B778C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 32px;
}

.kanban-modal .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.kanban-modal .cancel-btn {
  background-color: transparent;
  color: #42526E;
  border: none;
  padding: 8px 16px;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: none;
}

.kanban-modal .cancel-btn:hover {
  background-color: rgba(9, 30, 66, 0.08);
}

.kanban-modal button[type="submit"], 
.kanban-modal button[type="button"]:not(.cancel-btn, .close-modal) {
  background-color: #0052CC;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.kanban-modal button[type="submit"]:hover, 
.kanban-modal button[type="button"]:not(.cancel-btn, .close-modal):hover {
  background-color: #0747A6;
}

.kanban-modal .update-btn {
  background-color: #0052CC;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.kanban-modal .update-btn:hover {
  background-color: #0747A6;
}

.kanban-modal .assignee-dropdown {
  position: relative;
  width: 100%;
  margin-bottom: 8px;
}

.kanban-modal .assignee-display {
  transition: background-color 0.2s;
}

.kanban-modal .assignee-display:hover {
  background-color: #F4F5F7;
}

.kanban-modal .dropdown-item {
  transition: background-color 0.2s;
}

.kanban-modal .dropdown-item:hover {
  background-color: #F4F5F7 !important;
}

.kanban-modal .assignee-dropdown-menu::-webkit-scrollbar {
  width: 8px;
}

.kanban-modal .assignee-dropdown-menu::-webkit-scrollbar-track {
  background: #F4F5F7;
  border-radius: 4px;
}

.kanban-modal .assignee-dropdown-menu::-webkit-scrollbar-thumb {
  background: #DFE1E6;
  border-radius: 4px;
}

.kanban-modal .assignee-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #C1C7D0;
}

/* Checkbox styling */
.kanban-modal .dropdown-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 2px solid #DFE1E6;
  border-radius: 3px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
  position: relative;
  cursor: pointer;
  margin-right: 10px;
}

.kanban-modal .dropdown-item input[type="checkbox"]:checked {
  background-color: #0052CC;
  border-color: #0052CC;
}

.kanban-modal .dropdown-item input[type="checkbox"]:checked::after {
  content: "✓";
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
}

/* Make the dropdown look like Jira's */
.kanban-modal .assignee-dropdown .assignee-display {
  position: relative;
  padding-right: 30px;
}

.kanban-modal .assignee-dropdown .assignee-display::after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6B778C;
}

.kanban-root .kanban-card .assignee-row {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6B778C;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kanban-root .kanban-card .assignee-label {
  margin-right: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.kanban-root .kanban-card .assignee-list {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-grow: 1;
  overflow: hidden;
}

.kanban-root .kanban-card .assignee-item {
  display: flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-root .kanban-card .assignee-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 8px;
  font-weight: bold;
  color: white;
  margin-right: 4px;
  flex-shrink: 0;
}

.kanban-root .kanban-card .assignee-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-root .kanban-card .more-count {
  font-weight: 500;
  color: #42526E;
  flex-shrink: 0;
}

.kanban-root .kanban-card .due-date-row {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.kanban-root .kanban-card .due-date-label {
  font-weight: 500;
  margin-right: 6px;
  flex-shrink: 0;
}

/* Avatar background colors */
.kanban-root .assignee-blue { background-color: #4C9AFF; }
.kanban-root .assignee-purple { background-color: #6554C0; }
.kanban-root .assignee-teal { background-color: #00B8D9; }
.kanban-root .assignee-green { background-color: #36B37E; }
.kanban-root .assignee-orange { background-color: #FF8B00; }
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

  // Process assignees - handle both assignee (string) and assignees (array)
  const getAssignees = () => {
    // Handle multiple assignees in different formats
    let assigneesList = [];
    
    // Case 1: task.assignees is an array
    if (task.assignees && Array.isArray(task.assignees)) {
      assigneesList = task.assignees;
    }
    // Case 2: task.assignee is a comma-separated string
    else if (task.assignee && typeof task.assignee === 'string' && task.assignee.includes(',')) {
      assigneesList = task.assignee.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    // Case 3: task.assignee is a single string (not comma-separated)
    else if (task.assignee && typeof task.assignee === 'string') {
      assigneesList = [task.assignee];
    }
    
    return assigneesList;
  };

  // Get initials from email
  const getInitials = (email) => {
    if (!email) return 'NA';
    
    // Extract username part from email
    const username = email.split('@')[0];
    
    // Get initials from username
    if (username.includes('.')) {
      // If username has dots (e.g., "john.doe"), take first letters of each part
      return username.split('.')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
    } else {
      // Otherwise take first two letters
      return username.substring(0, 2).toUpperCase();
    }
  };
  
  // Extract username from email (part before @)
  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    return email.split('@')[0];
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent opening the task modal
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  };

  // Get assignee list
  const assignees = getAssignees();
  const hasAssignees = assignees.length > 0;
  
  // Colors for avatars
  const avatarColorClasses = ['assignee-blue', 'assignee-purple', 'assignee-teal', 'assignee-green', 'assignee-orange'];
  
  // Max assignees to show directly
  const maxVisibleAssignees = 2;
  const showCount = assignees.length > maxVisibleAssignees;
  const visibleAssignees = showCount ? assignees.slice(0, maxVisibleAssignees) : assignees;

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => {
        // When starting drag, prevent opening modal
        e.stopPropagation();
        onDragStart(e, task.id);
      }}
      data-id={task.id}
      onClick={() => onEditTask(task.id)} // Open edit modal when clicking anywhere on the card
    >
      <div className="card-actions">
        <button
          className="btn delete-btn"
          onClick={handleDelete}
        >
          🗑️
        </button>
      </div>
      <div className="card-labels">
        <div className={`label ${task.priority}`}></div>
      </div>
      <div className="card-title">{task.title}</div>
      <div className="card-description">{task.description}</div>
      
      {/* Metadata section */}
      <div style={{ marginTop: '12px' }}>
        {/* Assignees Row */}
        {hasAssignees && (
          <div className="assignee-row">
            <span className="assignee-label">Assign:</span>
            <div className="assignee-list">
              {/* Show visible assignees horizontally */}
              {visibleAssignees.map((assignee, index) => (
                <div key={index} className="assignee-item">
                  <div className={`assignee-avatar ${avatarColorClasses[index % avatarColorClasses.length]}`}>
                    {getInitials(assignee)}
                  </div>
                  <span className="assignee-name" title={assignee}>
                    {getUsernameFromEmail(assignee)}
                  </span>
                </div>
              ))}
              
              {/* Show count of additional assignees if needed */}
              {showCount && (
                <div className="more-count">
                  +{assignees.length - maxVisibleAssignees}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Due Date Row */}
        <div className={`due-date-row ${isOverdue() ? 'overdue' : ''}`}>
          <span className="due-date-label">
            {isDone ? 'Completed:' : 'Due:'}
          </span>
          <span>
            {dueDateValue ? formatDate(dueDateValue) : 'No due date'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Column Component
const Column = ({
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
            onDeleteTask={onDeleteTask}
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

const TaskModal = ({ onClose, onSave, task, isEdit, projectId }) => {
  const [formData, setFormData] = useState({
    id: task?.id || null,
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    assignees: [], // Changed from assignee (singular) to assignees (array)
    column: 'todo',
    project_id: projectId || ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  // Format the creation date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Set initial form data if editing a task
  useEffect(() => {
    if (isEdit && task) {
      let dateOnly = '';
      if (typeof task.due_date === 'string') {
        // If task.due_date is already a string in "YYYY-MM-DD" format
        dateOnly = task.due_date;
      } else if (task.due_date) {
        dateOnly = new Date(task.due_date).toISOString().split('T')[0];
      }

      // Handle assignees - convert existing assignee to array if it's a string
      const assigneeArray = 
      Array.isArray(task.assignees) ? task.assignees :
      typeof task.assignee === 'string' ? task.assignee.split(',').map(s=>s.trim()).filter(Boolean) :
      [];

      setFormData({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        dueDate: dateOnly,
        assignees: assigneeArray,
        column: task.column || task.column_status || 'todo',
        project_id: projectId || task.project_id || '',
        created_at: task.created_at,
        updated_at: task.updated_at
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
    
    // Create a copy of formData that formats the data as expected by the API
    const apiPayload = {
      ...formData,
      // If no assignees, use single empty string for backward compatibility
      assignee: formData.assignees.length > 0 ? formData.assignees.join(',') : ''
    };
    
    onSave(apiPayload);
  };

  // Handle assignees change - receive array of emails
  const handleAssigneesChange = (assigneesArray) => {
    setFormData(prev => ({
      ...prev,
      assignees: assigneesArray
    }));
  };

  // Generate the priority badge
  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: '#DE350B',
      medium: '#F5A623',
      low: '#36B37E'
    };
    
    return (
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        color: colors[priority],
        fontWeight: 500
      }}>
        <span style={{ 
          display: 'inline-block', 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: colors[priority],
          marginRight: '6px'
        }}></span>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </div>
    );
  };

  return (
    <div className="modal-body">
      <div className="modal-main">
        <form id="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              type="text"
              id="task-title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a description..."
              rows="5"
            ></textarea>
          </div>
          
          {isEdit && (
            <div style={{ marginBottom: '20px', color: '#6B778C', fontSize: '12px' }}>
              {formData.created_at && (
                <div>Created {formatDate(formData.created_at)}</div>
              )}
              {formData.updated_at && formData.updated_at !== formData.created_at && (
                <div>Updated {formatDate(formData.updated_at)}</div>
              )}
            </div>
          )}
        </form>
      </div>
      
      <div className="modal-sidebar">
        <div className="modal-section">
          <div className="modal-section-title">Status</div>
          <select
            id="task-column"
            value={formData.column}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div className="modal-section">
          <div className="modal-section-title">Priority</div>
          <select
            id="task-priority"
            value={formData.priority}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <PriorityBadge priority={formData.priority} />
        </div>
        
        <div className="modal-section">
          <div className="modal-section-title">Assignees</div>
          <AssigneeDropdown
            projectId={projectId}
            selectedAssignees={formData.assignees}
            onAssigneeChange={handleAssigneesChange}
            API_BASE_URL={API_BASE_URL}
          />
        </div>
        
        <div className="modal-section">
          <div className="modal-section-title">Due Date</div>
          <input
            type="date"
            id="task-dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>

        {/* Hidden field for project_id */}
        <input
          type="hidden"
          id="task-project_id"
          value={formData.project_id}
        />
      </div>
    </div>
  );
};

// KanbanBoardView Component
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

// Main KanbanBoard Component
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
  useEffect(() => {
    if (projectId) {
      axios.get(`${API_BASE_URL}/api/projects/${projectId}`)
        .then(response => {
          if (response.data.success) {
            setProjectTitle(response.data.data.title);
          } else {
            console.error("API returned success=false:", response.data.error);
          }
        })
        .catch(error => {
          console.error("Error fetching project details:", error);
        });
    }
  }, [projectId, API_BASE_URL]);

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
        column: task.column_status || task.status
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
        assignees: taskData.assignees
      };
  
      if (taskData.id) {
        // Editing task - use PUT method for update
        console.log('Updating task with payload:', apiPayload);
        await axios.put(`${API_BASE_URL}/api/tasks/${taskData.id}`, apiPayload);
        showNotification('Task updated successfully', 'success');
      } else {
        // Creating new task - use POST method
        console.log('Creating task with payload:', apiPayload);
        await axios.post(`${API_BASE_URL}/api/tasks`, apiPayload);
        showNotification('Task created successfully', 'success');
      }
  
      // Refresh tasks after saving
      await fetchTasks();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving task:', err);
      showNotification(
        `Failed to save task: ${err.response?.data?.error || err.message}`,
        'error'
      );
    }
  };

  // Move a task to a different column
  const moveTask = async (taskId, newColumn) => {
    try {
      // Update state in React first (Optimistic UI)
      setTasksData(prevTasks =>
        prevTasks.map(task =>
          task.id === parseInt(taskId)
            ? { ...task, column: newColumn, column_status: newColumn, status: newColumn }
            : task
        )
      );
  
      // Call API to update in DB
      await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/column`, { column: newColumn });
      showNotification('Task moved successfully', 'success');
    } catch (err) {
      console.error('Error moving task:', err);
      fetchTasks(); // fallback to fetch latest data from DB
      showNotification('Failed to move task: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      showNotification('Task deleted successfully', 'success');
      fetchTasks(); // Refresh tasks after deletion
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

  if (loading && tasksData.length === 0) {
    return (
      <Box className="app" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Update the return statement in your KanbanBoard component:

return (
  <Box className="kanban-root">
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
      onDeleteTask={deleteTask}
    />

{showModal && (
  <div className="kanban-modal">
    <div className="modal-content">
      <div className="modal-header">
        <h3 className="modal-title">{currentTaskId ? 'Edit Task' : 'New Task'}</h3>
        <button className="close-modal" onClick={() => {
          setShowModal(false);
          setCurrentTaskId(null);
        }}>×</button>
      </div>
      
      <TaskModal
        onClose={() => {
          setShowModal(false);
          setCurrentTaskId(null);
        }}
        onSave={saveTask}
        task={currentTaskId ? getTaskById(currentTaskId) : { column: selectedColumn, assignees: [] }}
        isEdit={!!currentTaskId}
        projectId={projectId}
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
        <button 
          type="button" 
          className="update-btn" 
          onClick={() => {
            const taskForm = document.getElementById('task-form');
            if (taskForm) {
              // Trigger form submission by creating and dispatching a submit event
              const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
              taskForm.dispatchEvent(submitEvent);
            }
          }}
        >
          {currentTaskId ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  </div>
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