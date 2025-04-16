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
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TodayIcon from '@mui/icons-material/Today';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from 'axios';
import { UserContext } from "../../../context/Usercontext";

const ArchiveModal = ({ open, onClose, onProjectRestored }) => {
    const { customUser } = useContext(UserContext);
    const [archivedProjects, setArchivedProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        projectId: null
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

    // Fetch archived projects
    const fetchArchivedProjects = async () => {
        setLoading(true);
        try {
            const userId = customUser?.user_id;
            if (!userId) {
                setNotification({ open: true, message: "User data is not available", type: "error" });
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/projects/archive?userId=${userId}`);
            if (response.data.success) {
                setArchivedProjects(response.data.data);
            } else {
                throw new Error(response.data.error || "Failed to fetch archived projects");
            }
        } catch (error) {
            console.error("Error fetching archived projects:", error);
            setNotification({ open: true, message: error.message, type: 'error' });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open) {
            fetchArchivedProjects();
        }
    }, [open, customUser]);

    // Function to restore project
    const restoreProject = async (projectId) => {
        try {
            await axios.patch(`${API_BASE_URL}/projects/${projectId}/restore`);
            setNotification({ open: true, message: "Project restored successfully", type: "success" });
            // Remove restored project from archivedProjects
            setArchivedProjects(prev => prev.filter(project => project.project_id !== projectId));
            // Send callback to parent component to update active project list
            if (onProjectRestored) {
                onProjectRestored(projectId);
            }
        } catch (error) {
            setNotification({ open: true, message: error.message, type: "error" });
        }
    };

    // Function to purge project (delete permanently)
    // Function to initiate project deletion
    const initiateDelete = (projectId) => {
        setDeleteConfirmation({
            open: true,
            projectId: projectId
        });
    };

    // Function to purge project (delete permanently)
    const purgeProject = async () => {
        try {
            const projectId = deleteConfirmation.projectId;
            await axios.delete(`${API_BASE_URL}/projects/${projectId}/purge`);
            setNotification({ open: true, message: "Project permanently deleted", type: "success" });
            setArchivedProjects(prev => prev.filter(project => project.project_id !== projectId));
            if (onProjectRestored) {
                onProjectRestored(projectId);
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
            projectId: null
        });
    };

    const closeNotification = () => setNotification(prev => ({ ...prev, open: false }));

    if (!open) return null;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
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
                    Archived Projects
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
                ) : archivedProjects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                            No archived projects available
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {archivedProjects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project.project_id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        border: '1px solid #e5e7eb',
                                        '&:hover': {
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        p: 2.5,
                                        pb: 1.5
                                    }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#111827',
                                                fontSize: '1.1rem',
                                                mb: 2
                                            }}
                                        >
                                            {project.title}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                            {project.priority && (
                                                <Chip
                                                    label={project.priority}
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '16px',
                                                        bgcolor: project.priority.toLowerCase() === 'high' ? '#fee2e2' : '#e0e7ff',
                                                        color: project.priority.toLowerCase() === 'high' ? '#ef4444' : '#4f46e5',
                                                        '& .MuiChip-label': { px: 1 },
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                    icon={
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: project.priority.toLowerCase() === 'high' ? '#ef4444' : '#4f46e5',
                                                                ml: 1
                                                            }}
                                                        />
                                                    }
                                                />
                                            )}
                                            {project.category && (
                                                <Chip
                                                    label={project.category}
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '16px',
                                                        bgcolor: '#eef2ff',
                                                        color: '#4f46e5',
                                                        '& .MuiChip-label': { px: 1 },
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {project.due_date && (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#6b7280',
                                                mt: 'auto'
                                            }}>
                                                <TodayIcon fontSize="small" sx={{ mr: 0.5, color: '#9ca3af' }} />
                                                <Typography variant="body2">
                                                    {formatDate(project.due_date)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        pt: 1,
                                        borderTop: '1px solid #e5e7eb',
                                        mt: 'auto'
                                    }}>
                                        <Button
                                            startIcon={<RestoreIcon />}
                                            variant="text"
                                            size="small"
                                            onClick={() => restoreProject(project.project_id)}
                                            sx={{
                                                textTransform: 'none',
                                                color: '#4f46e5'
                                            }}
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            startIcon={<DeleteForeverIcon />}
                                            variant="text"
                                            size="small"
                                            color="error"
                                            onClick={() => initiateDelete(project.project_id)}
                                            sx={{
                                                textTransform: 'none'
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
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
                            Are you sure you want to permanently delete this project? This action cannot be undone.
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
                            onClick={purgeProject}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            Delete Permanently
                        </Button>
                    </DialogActions>
                </Dialog>
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

export default ArchiveModal;