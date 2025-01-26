import React, { useState } from "react";
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
} from "@mui/material";
import projectIcon from "../../assets/icons/project.png";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const TopBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  // Mock Data สำหรับการแจ้งเตือน
  const notifications = [
    { id: 1, message: "New message from John", time: "5 mins ago", type: "message" },
    { id: 2, message: "Project deadline approaching", time: "1 day ago", type: "alert" },
    {
      id: 3,
      message: "You have been invited to Project Alpha",
      time: "2 hours ago",
      type: "invitation",
    },
  ];

  // เปิดเมนูแจ้งเตือน
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // ปิดเมนูแจ้งเตือน
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAcceptInvitation = (id) => {
    console.log(`Accepted invitation for notification ID: ${id}`);
    alert("You have accepted the invitation.");
  };

  const handleDeclineInvitation = (id) => {
    console.log(`Declined invitation for notification ID: ${id}`);
    alert("You have declined the invitation.");
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fff",
        color: "black",
        boxShadow: "none",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <img
            src={projectIcon}
            alt="Project Icon"
            style={{ width: 32, height: 32 }}
          />
          <Typography variant="h6" sx={{ color: "#4F46E5" }}>
            JiraDST
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleNotificationClick}>
            <NotificationsNoneIcon sx={{ cursor: "pointer" }} />
          </IconButton>
          <AccountCircleIcon sx={{ cursor: "pointer", width: "32px", height: "32px" }} />
        </Box>
      </Toolbar>

      {/* Popover สำหรับการแจ้งเตือน */}
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
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start" sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.time}
                  />
                  {notification.type === "invitation" && (
                    <Box display="flex" gap={1} width="100%" mt={1} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleAcceptInvitation(notification.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeclineInvitation(notification.id)}
                      >
                        Decline
                      </Button>
                    </Box>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Popover>
    </AppBar>
  );
};

export default TopBar;
