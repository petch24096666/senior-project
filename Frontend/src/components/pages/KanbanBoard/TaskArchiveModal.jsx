import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Grid,
  Paper,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from 'axios';
import { UserContext } from '../../../context/Usercontext';

const TaskArchiveModal = ({ open, onClose, projectId, onTaskRestored }) => {
  const { customUser } = useContext(UserContext);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    taskId: null
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  // Fetch archived tasks for this project
  const fetchArchivedTasks = async () => {
    setLoading(true);
    try {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      const response = await axios.get(`${API_BASE_URL}/tasks/archive?projectId=${projectId}`);
      if (response.data.success) {
        setArchivedTasks(response.data.data);
      } else {
        throw new Error(response.data.error || "Failed to fetch archived tasks");
      }
    } catch (error) {
      console.error("Error fetching archived tasks:", error);
      setNotification({ open: true, message: error.message, type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchArchivedTasks();
    }
  }, [open, projectId]);

  // Function to restore a task
  const restoreTask = async (taskId) => {
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/restore`);
      setNotification({ open: true, message: "Task restored successfully", type: "success" });
      // Remove restored task from archivedTasks in modal
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      // Send callback to parent component to update active tasks
      if (onTaskRestored) {
        onTaskRestored(taskId);
      }
    } catch (error) {
      setNotification({ open: true, message: error.message, type: "error" });
    }
  };

  // Function to purge a task (delete permanently)
// Function to initiate task deletion
const initiateDelete = (taskId) => {
  setDeleteConfirmation({
    open: true,
    taskId: taskId
  });
};

// Function to purge a task (delete permanently)
const purgeTask = async () => {
  try {
    const taskId = deleteConfirmation.taskId;
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}/purge`);
    setNotification({ open: true, message: "Task permanently deleted", type: "success" });
    setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
    if (onTaskRestored) {
      onTaskRestored(taskId);
    }
  } catch (error) {
    setNotification({ open: true, message: error.message, type: "error" });
  } finally {
    closeDeleteConfirmation();
  }
};

// Function to close the delete confirmation
const closeDeleteConfirmation = () => {
  setDeleteConfirmation({
    open: false,
    taskId: null
  });
};

  const closeNotification = () => setNotification(prev => ({ ...prev, open: false }));

  if (!open) return null;

  // Format date to match reference
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to remove email suffixes and get clean username
  const getCleanUsername = (assignee) => {
    if (!assignee) return '';
    
    // Remove @gmail.com or any other email suffix
    const emailParts = assignee.split('@');
    return emailParts[0];
  };

  // Get first letter of assignee for avatar
  const getAssigneeInitial = (assignee) => {
    const cleanName = getCleanUsername(assignee);
    if (!cleanName) return '';
    return cleanName.charAt(0).toUpperCase();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '8px'
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
          Archived Tasks
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : archivedTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No archived tasks available
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {archivedTasks.map(task => {
              // Get assignee from various possible formats
              let assignee = '';
              if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
                assignee = task.assignees[0];
              } else if (task.assignee && typeof task.assignee === 'string') {
                assignee = task.assignee.split(',')[0].trim();
              }
              
              const displayName = getCleanUsername(assignee);

              return (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    {/* Priority indicator bar at top */}
                    <Box 
                      sx={{ 
                        height: '4px',
                        width: '100%',
                        backgroundColor: task.priority === 'high' ? '#f44336' : 
                                         task.priority === 'medium' ? '#ff9800' : '#2196f3'
                      }} 
                    />
                    
                    {/* Task content */}
                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      {/* Title */}
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500, 
                          mb: 0.5,
                          color: '#212121'
                        }}
                      >
                        {task.title}
                      </Typography>
                      
                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#616161',
                          mb: 2
                        }}
                      >
                        {task.description || task.title}
                      </Typography>
                      
                      {/* Assignee */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#757575',
                            mr: 1,
                            fontWeight: 500
                          }}
                        >
                          Assign:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24,
                              fontSize: '0.8rem',
                              bgcolor: '#2196f3',
                              mr: 0.5
                            }}
                          >
                            {getAssigneeInitial(assignee) || <PersonIcon fontSize="small" />}
                          </Avatar>
                          <Typography variant="body2" sx={{ color: '#1976d2' }}>
                            {displayName || 'Unassigned'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Due date */}
                      {task.due_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#757575',
                              mr: 1,
                              fontWeight: 500
                            }}
                          >
                            Due:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#616161' }}>
                            {formatDate(task.due_date)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {/* Action buttons */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      borderTop: '1px solid #e0e0e0',
                      p: 1,
                      backgroundColor: '#f5f5f5'
                    }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => restoreTask(task.id)}
                        title="Restore task"
                      >
                        <RestoreIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => initiateDelete(task.id)}
                        title="Delete permanently"
                      >
                        <DeleteForeverIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 1.5 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onClose}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
      </DialogActions>
      
      <Dialog
  open={deleteConfirmation.open}
  onClose={closeDeleteConfirmation}
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
      Confirm Deletion
    </Typography>
    <IconButton onClick={closeDeleteConfirmation} size="small">
      <CloseIcon fontSize="small" />
    </IconButton>
  </DialogTitle>
  <Divider />
  <DialogContent sx={{ p: 2 }}>
    <Typography variant="body1">
      Are you sure you want to permanently delete this task? This action cannot be undone.
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
      onClick={purgeTask}
      sx={{ 
        textTransform: 'none',
        fontWeight: 500
      }}
    >
      Delete Permanently
    </Button>
  </DialogActions>
</Dialog>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type} 
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default TaskArchiveModal;