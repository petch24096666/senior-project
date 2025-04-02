import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Popover,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  ListItemAvatar,
  ListItemButton,
  Paper,
  Tooltip,
  ListSubheader,
} from "@mui/material";
import projectIcon from "../../assets/icons/project.png";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../../utils/supabaseClient";

const TopBar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

  // Fetch notifications
  useEffect(() => {
    // Mock data - in production, replace with API call
    const mockNotifications = [
      { id: 1, message: "New message from John", time: "5 mins ago", type: "message", read: false },
      { id: 2, message: "Project deadline approaching", time: "1 day ago", type: "alert", read: false },
      { id: 3, message: "You have been invited to Project Alpha", time: "2 hours ago", type: "invitation", read: false },
      { id: 4, message: "Task 'Update documentation' was assigned to you", time: "3 hours ago", type: "assignment", read: true },
      { id: 5, message: "Jane commented on your task", time: "1 day ago", type: "message", read: true },
    ];
    
    setNotifications(mockNotifications);
    
    // Count unread notifications
    const unread = mockNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
    
    // In a real app, you would fetch from an API:
    // const fetchNotifications = async () => {
    //   setLoading(true);
    //   try {
    //     const authToken = localStorage.getItem("authToken");
    //     const response = await axios.get(`${url}/api/notifications`, {
    //       headers: { Authorization: `Bearer ${authToken}` },
    //     });
    //     setNotifications(response.data);
    //     const unread = response.data.filter(notif => !notif.read).length;
    //     setUnreadCount(unread);
    //   } catch (error) {
    //     console.error("Failed to fetch notifications:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchNotifications();
  }, []);

  // Function to get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageIcon color="primary" />;
      case "alert":
        return <AssignmentLateIcon color="error" />;
      case "invitation":
        return <GroupAddIcon color="success" />;
      case "assignment":
        return <AssignmentLateIcon color="warning" />;
      default:
        return <NotificationsNoneIcon />;
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    // Update local state
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    
    // Update unread count
    const unread = updatedNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
    
    // In a real app, update on the server:
    // try {
    //   const authToken = localStorage.getItem("authToken");
    //   await axios.put(`${url}/api/notifications/${id}/read`, {}, {
    //     headers: { Authorization: `Bearer ${authToken}` },
    //   });
    // } catch (error) {
    //   console.error("Failed to mark notification as read:", error);
    // }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    // In a real app, update on the server:
    // try {
    //   const authToken = localStorage.getItem("authToken");
    //   await axios.put(`${url}/api/notifications/read-all`, {}, {
    //     headers: { Authorization: `Bearer ${authToken}` },
    //   });
    // } catch (error) {
    //   console.error("Failed to mark all notifications as read:", error);
    // }
  };

  // Handle notification click
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close notification menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle clicking on a notification
  const handleNotificationItemClick = (id, type) => {
    markAsRead(id);
    
    // Navigate based on notification type
    switch (type) {
      case "message":
        navigate("/messages");
        break;
      case "invitation":
        navigate("/projects");
        break;
      case "assignment":
      case "alert":
        navigate("/tasks");
        break;
      default:
        break;
    }
    
    handleClose();
  };

  // Profile dropdown handlers
  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleEditProfile = () => {
    navigate("/profile");
    handleProfileClose();
  };

  const handleLogout = async () => {
    try {
      // Logout from Supabase
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) {
        console.error("❌ Supabase Logout Error:", supabaseError);
      } else {
        console.log("✅ Supabase Logout Success");
      }

      // Clear all local storage and session data
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log("localStorage and session cleared");
      
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        try {
          const response = await axios.post(`${url}/api/logout`, {}, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          console.log("✅ API Logout Response:", response.data);
        } catch (apiError) {
          console.error("❌ API Logout Error:", apiError);
        }
      }

      // Prevent back navigation after logout
      window.history.pushState(null, "", "/");
      window.history.replaceState(null, "", "/");
      window.onpopstate = () => {
        window.history.pushState(null, "", "/");
      };

      // Redirect to login page
      navigate("/", { replace: true });

    } catch (error) {
      console.error("❌ Logout Error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const open = Boolean(anchorEl);
  const profileOpen = Boolean(profileAnchorEl);
  const id = open ? "notification-popover" : undefined;

  // Group notifications by date
  const todayNotifications = notifications.filter(
    n => n.time.includes("mins") || n.time.includes("hours")
  );
  
  const earlierNotifications = notifications.filter(
    n => n.time.includes("day") || n.time.includes("week")
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fff",
        color: "black",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <img
            src={projectIcon}
            alt="Project Icon"
            style={{ width: 32, height: 32 }}
          />
          <Typography variant="h6" sx={{ color: "#4F46E5", fontWeight: 600 }}>
            JiraDST
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Notification Button with Badge */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationClick} size="medium">
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneIcon sx={{ color: "#555" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notification Popover */}
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                width: "350px",
                maxHeight: "400px",
                borderRadius: 1,
                overflow: "hidden",
              }
            }}
          >
            <Paper
              sx={{
                overflow: "auto",
                maxHeight: "400px",
              }}
              elevation={0}
            >
              {/* Notification Header */}
              <Box 
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #eaeaea",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Tooltip title="Mark all as read">
                    <IconButton size="small" onClick={markAllAsRead}>
                      <ClearAllIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Notification List */}
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }} dense>
                  {todayNotifications.length > 0 && (
                    <ListSubheader sx={{ backgroundColor: "#f5f5f5", lineHeight: "30px" }}>
                      Today
                    </ListSubheader>
                  )}
                  
                  {todayNotifications.map((notification) => (
                    <ListItemButton
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification.id, notification.type)}
                      sx={{
                        backgroundColor: !notification.read ? "rgba(25, 118, 210, 0.08)" : "transparent",
                        "&:hover": {
                          backgroundColor: !notification.read ? "rgba(25, 118, 210, 0.12)" : "rgba(0, 0, 0, 0.04)",
                        },
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notification.read ? "action.selected" : "primary.light" }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={!notification.read ? 600 : 400}>
                            {notification.message}
                          </Typography>
                        }
                        secondary={notification.time}
                      />
                    </ListItemButton>
                  ))}

                  {earlierNotifications.length > 0 && (
                    <ListSubheader sx={{ backgroundColor: "#f5f5f5", lineHeight: "30px" }}>
                      Earlier
                    </ListSubheader>
                  )}
                  
                  {earlierNotifications.map((notification) => (
                    <ListItemButton
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification.id, notification.type)}
                      sx={{
                        backgroundColor: !notification.read ? "rgba(25, 118, 210, 0.08)" : "transparent",
                        "&:hover": {
                          backgroundColor: !notification.read ? "rgba(25, 118, 210, 0.12)" : "rgba(0, 0, 0, 0.04)",
                        },
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notification.read ? "action.selected" : "primary.light" }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={!notification.read ? 600 : 400}>
                            {notification.message}
                          </Typography>
                        }
                        secondary={notification.time}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
              
              {/* View All Link */}
              {notifications.length > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: "1px solid #eaeaea",
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      navigate("/notifications");
                      handleClose();
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    View all notifications
                  </Button>
                </Box>
              )}
            </Paper>
          </Popover>

          {/* Profile Button */}
          <Tooltip title="Account">
            <IconButton onClick={handleProfileClick}>
              <AccountCircleIcon sx={{ cursor: "pointer", width: "32px", height: "32px", color: "#555" }} />
            </IconButton>
          </Tooltip>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={profileAnchorEl}
            open={profileOpen}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              elevation: 3,
              sx: { 
                minWidth: "180px",
                mt: 0.5,
                "& .MuiMenuItem-root": {
                  py: 1,
                  px: 2,
                },
              }
            }}
          >
            <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;