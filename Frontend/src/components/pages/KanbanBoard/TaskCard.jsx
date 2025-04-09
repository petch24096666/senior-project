import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBAC';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TaskCard = ({ projectId,task, onDragStart, onEditTask, onDeleteTask, isDone }) => {
  const { canCreateTask, canEditTask, canDeleteTask, canMoveTask } = useRBAC();
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false
  });

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

const initiateDelete = (e) => {
  e.stopPropagation();
  setDeleteConfirmation({ open: true });
};

const confirmDelete = (e) => {
  if (e) e.stopPropagation();
  if (onDeleteTask) {
    onDeleteTask(task.id);
  }
  closeDeleteConfirmation();
};

const closeDeleteConfirmation = (e) => {
  if (e) e.stopPropagation();
  setDeleteConfirmation({ open: false });
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
        <button className="btn delete-btn" onClick={initiateDelete}>
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
      <Dialog
      open={deleteConfirmation.open}
      onClose={closeDeleteConfirmation}
      onClick={(e) => e.stopPropagation()}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '8px',
          maxWidth: '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Archive Task
        </Typography>
        <IconButton onClick={closeDeleteConfirmation} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2 }}>
        <Typography variant="body1">
          Are you sure you want to archive this task? You can restore it later from the archive.
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={closeDeleteConfirmation}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          size="small" 
          color="error"
          onClick={confirmDelete}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Archive Task
        </Button>
      </DialogActions>
    </Dialog>
    </div>
    
  );
};

export default TaskCard;
