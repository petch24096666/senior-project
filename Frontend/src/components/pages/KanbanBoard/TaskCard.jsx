import React from 'react';
import { useRBAC } from '../../../context/RBAC';

const TaskCard = ({ projectId,task, onDragStart, onEditTask, onDeleteTask, isDone }) => {
  const { canCreateTask, canEditTask, canDeleteTask, canMoveTask } = useRBAC();
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const isOverdue = () => {
    if (isDone) return false;
    const dueDate = task.dueDate || task.due_date;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getAssignees = () => {
    let assigneesList = [];
    if (task.assignees && Array.isArray(task.assignees)) {
      assigneesList = task.assignees;
    } else if (task.assignee && typeof task.assignee === 'string' && task.assignee.includes(',')) {
      assigneesList = task.assignee.split(',').map(item => item.trim()).filter(item => item !== '');
    } else if (task.assignee && typeof task.assignee === 'string') {
      assigneesList = [task.assignee];
    }
    return assigneesList;
  };

  const getInitials = (email) => {
    if (!email) return 'NA';
    const username = email.split('@')[0];
    if (username.includes('.')) {
      return username.split('.').map(part => part.charAt(0)).join('').toUpperCase();
    } else {
      return username.substring(0, 2).toUpperCase();
    }
  };

  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    return email.split('@')[0];
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  };

  const assignees = getAssignees();
  const hasAssignees = assignees.length > 0;
  const avatarColorClasses = ['assignee-blue', 'assignee-purple', 'assignee-teal', 'assignee-green', 'assignee-orange'];
  const maxVisibleAssignees = 2;
  const showCount = assignees.length > maxVisibleAssignees;
  const visibleAssignees = showCount ? assignees.slice(0, maxVisibleAssignees) : assignees;

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(e, task.id);
      }}
      onClick={() => onEditTask(task.id)}
    >
      <div className="card-actions">
      { canDeleteTask(projectId) && (
        <button className="btn delete-btn" onClick={handleDelete}>
          🗑️
        </button>
        )}
      </div>
      <div className="card-labels">
        <div className={`label ${task.priority}`}></div>
      </div>
      <div className="card-title">{task.title}</div>
      <div className="card-description">{task.description}</div>
      <div style={{ marginTop: '12px' }}>
        {hasAssignees && (
          <div className="assignee-row">
            <span className="assignee-label">Assign:</span>
            <div className="assignee-list">
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
              {showCount && (
                <div className="more-count">
                  +{assignees.length - maxVisibleAssignees}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={`due-date-row ${isOverdue() ? 'overdue' : ''}`}>
          <span className="due-date-label">
            {isDone ? 'Completed:' : 'Due:'}
          </span>
          <span>
            {task.dueDate || task.due_date ? formatDate(task.dueDate || task.due_date) : 'No due date'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
