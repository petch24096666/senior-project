import React, { useState, useEffect, useContext } from "react";
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
import { UserContext } from "../../context/Usercontext";  // import context

const TopBar = () => {
  const navigate = useNavigate();
  const { customUser } = useContext(UserContext); // ดึง customUser จาก context

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

  // Fetch notifications (mock data)
  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: "New message from John", time: "5 mins ago", type: "message", read: false },
      { id: 2, message: "Project deadline approaching", time: "1 day ago", type: "alert", read: false },
      { id: 3, message: "You have been invited to Project Alpha", time: "2 hours ago", type: "invitation", read: false },
      { id: 4, message: "Task 'Update documentation' was assigned to you", time: "3 hours ago", type: "assignment", read: true },
      { id: 5, message: "Jane commented on your task", time: "1 day ago", type: "message", read: true },
    ];
    setNotifications(mockNotifications);
    const unread = mockNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  }, []);

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

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    const unread = updatedNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationItemClick = (id, type) => {
    markAsRead(id);
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
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) {
        console.error("❌ Supabase Logout Error:", supabaseError);
      }
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
      window.history.pushState(null, "", "/");
      window.history.replaceState(null, "", "/");
      window.onpopstate = () => {
        window.history.pushState(null, "", "/");
      };
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ Logout Error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const open = Boolean(anchorEl);
  const profileOpen = Boolean(profileAnchorEl);
  const id = open ? "notification-popover" : undefined;

  // Group notifications by time
  const todayNotifications = notifications.filter(
    n => n.time.includes("mins") || n.time.includes("hours")
  );
  const earlierNotifications = notifications.filter(
    n => n.time.includes("day") || n.time.includes("week")
  );

  // Function to generate initials for avatar
  const getInitials = (email) => {
    if (!email) return "U";
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Get display name (username from email or full name if available)
  const getDisplayName = () => {
    if (customUser?.name) return customUser.name;
    if (customUser?.email) {
      const username = customUser.email.split('@')[0];
      // Convert username like "john.doe" or "john_doe" to "John Doe"
      return username
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return "User";
  };

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
          {/* User info with avatar and name/email */}
{/* User info with avatar and full email */}
{customUser?.email && (
  <Box 
    display="flex" 
    alignItems="center" 
    gap={1.5}
    onClick={handleProfileClick}
    sx={{
      padding: "6px 12px",
      borderRadius: "24px",
      border: "1px solid #eaeaea",
      transition: "all 0.2s",
      cursor: "pointer",
      '&:hover': {
        backgroundColor: "#f5f6fa",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)"
      }
    }}
  >
    <Avatar 
      sx={{ 
        width: 32, 
        height: 32, 
        bgcolor: "#4F46E5", 
        fontSize: "14px",
        fontWeight: "bold" 
      }}
    >
      {getInitials(customUser.email)}
    </Avatar>
    <Typography 
      variant="body2" 
      sx={{ 
        color: "#333",
        fontWeight: 500,
        display: { xs: 'none', sm: 'block' }  // Hide on mobile
      }}
    >
      {customUser.email}
    </Typography>
  </Box>
)}        
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationClick} size="medium">
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneIcon sx={{ color: "#555" }} />
              </Badge>
            </IconButton>
          </Tooltip>
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
              },
            }}
          >
            <Paper
              sx={{
                overflow: "auto",
                maxHeight: "400px",
              }}
              elevation={0}
            >
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
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }} dense>
                  {todayNotifications.length > 0 && (
                    <ListSubheader
                      sx={{ backgroundColor: "#f5f5f5", lineHeight: "30px" }}
                    >
                      Today
                    </ListSubheader>
                  )}
                  {todayNotifications.map((notification) => (
                    <ListItemButton
                      key={notification.id}
                      onClick={() =>
                        handleNotificationItemClick(
                          notification.id,
                          notification.type
                        )
                      }
                      sx={{
                        backgroundColor: !notification.read
                          ? "rgba(25, 118, 210, 0.08)"
                          : "transparent",
                        "&:hover": {
                          backgroundColor: !notification.read
                            ? "rgba(25, 118, 210, 0.12)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: notification.read
                              ? "action.selected"
                              : "primary.light",
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={!notification.read ? 600 : 400}
                          >
                            {notification.message}
                          </Typography>
                        }
                        secondary={notification.time}
                      />
                    </ListItemButton>
                  ))}
                  {earlierNotifications.length > 0 && (
                    <ListSubheader
                      sx={{ backgroundColor: "#f5f5f5", lineHeight: "30px" }}
                    >
                      Earlier
                    </ListSubheader>
                  )}
                  {earlierNotifications.map((notification) => (
                    <ListItemButton
                      key={notification.id}
                      onClick={() =>
                        handleNotificationItemClick(
                          notification.id,
                          notification.type
                        )
                      }
                      sx={{
                        backgroundColor: !notification.read
                          ? "rgba(25, 118, 210, 0.08)"
                          : "transparent",
                        "&:hover": {
                          backgroundColor: !notification.read
                            ? "rgba(25, 118, 210, 0.12)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: notification.read
                              ? "action.selected"
                              : "primary.light",
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={!notification.read ? 600 : 400}
                          >
                            {notification.message}
                          </Typography>
                        }
                        secondary={notification.time}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
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
              },
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