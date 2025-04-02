import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button as MuiButton,
} from "@mui/material";

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
`;

// Task Card Component - renamed to avoid conflicts with MUI Card
const TaskCard = ({ task, onDragStart, onEditTask, isDone }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    
    return `${month} ${day}`;
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (isDone) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div 
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      data-id={task.id}
    >
      <div className="card-labels">
        <div className={`label ${task.priority}`}></div>
      </div>
      <div className="card-title">{task.title}</div>
      <div className="card-description">{task.description}</div>
      <div className="card-meta">
        <div className={`due-date ${isOverdue() ? 'overdue' : ''}`}>
          {isDone ? 'Completed: ' : 'Due: '}{formatDate(task.dueDate)}
        </div>
        <div className="avatar">{task.assignee}</div>
      </div>
      <button 
        className="edit-btn"
        onClick={(e) => {
          e.stopPropagation();
          onEditTask(task.id);
        }}
      >
        ✏️
      </button>
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

// TaskModal Component
const TaskModal = ({ onClose, onSave, task, isEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    assignee: '',
    column: 'todo'
  });

  // Set initial form data if editing a task
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        dueDate: task.dueDate || '',
        assignee: task.assignee || '',
        column: task.column || 'todo'
      });
    }
  }, [task]);

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
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// KanbanBoardView Component
const KanbanBoardView = ({ tasks, onEditTask, onMoveTask, onAddCard }) => {
  // Group tasks by column
  const todoTasks = tasks.filter(task => task.column === 'todo');
  const inProgressTasks = tasks.filter(task => task.column === 'inprogress');
  const reviewTasks = tasks.filter(task => task.column === 'review');
  const doneTasks = tasks.filter(task => task.column === 'done');

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
        onAddCard={onAddCard}
      />
    </div>
  );
};

// Main KanbanBoard Component
const KanbanBoard = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState('todo');
  const [tasksData, setTasksData] = useState([
    // To Do
    {
      id: "task-1",
      title: "Design landing page",
      description: "Create wireframes and mockups for the new marketing site",
      priority: "high",
      dueDate: "2025-03-25",
      assignee: "JD",
      column: "todo"
    },
    {
      id: "task-2",
      title: "Update documentation",
      description: "Review and update user guide with new features",
      priority: "medium",
      dueDate: "2025-04-02",
      assignee: "TK",
      column: "todo"
    },
    {
      id: "task-3",
      title: "Research competitors",
      description: "Analyze top 5 competitors' feature sets",
      priority: "low",
      dueDate: "2025-04-05",
      assignee: "AS",
      column: "todo"
    },
    // In Progress
    {
      id: "task-4",
      title: "Implement login system",
      description: "Create user authentication flow and account setup",
      priority: "high",
      dueDate: "2025-04-01",
      assignee: "RJ",
      column: "inprogress"
    },
    {
      id: "task-5",
      title: "Create email templates",
      description: "Design responsive email templates for onboarding",
      priority: "medium",
      dueDate: "2025-04-03",
      assignee: "LM",
      column: "inprogress"
    },
    // Review
    {
      id: "task-6",
      title: "QA testing for v2.0",
      description: "Complete test cases for the new features",
      priority: "high",
      dueDate: "2025-03-30",
      assignee: "PL",
      column: "review"
    },
    {
      id: "task-7",
      title: "Code review",
      description: "Review PR #342 for the payment integration",
      priority: "low",
      dueDate: "2025-03-31",
      assignee: "KJ",
      column: "review"
    },
    // Done
    {
      id: "task-8",
      title: "Set up CI/CD pipeline",
      description: "Configure automated testing and deployment",
      priority: "medium",
      dueDate: "2025-03-22",
      assignee: "DM",
      column: "done"
    },
    {
      id: "task-9",
      title: "Database migration",
      description: "Migrate from MySQL to PostgreSQL",
      priority: "high",
      dueDate: "2025-03-20",
      assignee: "JT",
      column: "done"
    },
    {
      id: "task-10",
      title: "Team meeting",
      description: "Weekly sprint planning and backlog grooming",
      priority: "low",
      dueDate: "2025-03-18",
      assignee: "TM",
      column: "done"
    }
  ]);

  // Generate a unique ID for a new task
  const generateTaskId = () => {
    return 'task-' + Date.now() + Math.floor(Math.random() * 1000);
  };

  // Add or update a task
  const saveTask = (taskData) => {
    if (currentTaskId) {
      // Update existing task
      const updatedTasks = tasksData.map(task => 
        task.id === currentTaskId ? { ...task, ...taskData } : task
      );
      setTasksData(updatedTasks);
    } else {
      // Create new task
      const newTask = {
        id: generateTaskId(),
        ...taskData,
        column: selectedColumn
      };
      setTasksData([...tasksData, newTask]);
    }
    setShowModal(false);
    setCurrentTaskId(null);
  };

  // Move a task to a different column
  const moveTask = (taskId, newColumn) => {
    const updatedTasks = tasksData.map(task => 
      task.id === taskId ? { ...task, column: newColumn } : task
    );
    setTasksData(updatedTasks);
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
    return tasksData.find(task => task.id === taskId);
  };

  return (
    <Box className="app">
      {/* Embed CSS */}
      <style>{styles}</style>
      
      <header className="header">
        <h1>My Kanban Board</h1>
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
        />
      )}
    </Box>
  );
};

export default KanbanBoard;