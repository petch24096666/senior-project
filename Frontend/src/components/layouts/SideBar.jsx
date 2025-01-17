import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState("");

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
  };

  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: "#fff",
        height: "100vh",
        p: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: "#6B7280",
          fontSize: "12px",
          mb: 1,
          textTransform: "uppercase",
        }}
      >
        Main Menu
      </Typography>
      <List sx={{ mb: 2, p: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/dashboard"
            onClick={() => handleMenuClick("Dashboard")}
            sx={{
              color: activeMenu === "Dashboard" ? "#4F46E5" : "#374151",
              "& .MuiListItemIcon-root": {
                color: activeMenu === "Dashboard" ? "#4F46E5" : "#374151",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                sx: { fontSize: "16px" },
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/projects"
            onClick={() => handleMenuClick("Projects")}
            sx={{
              color: activeMenu === "Projects" ? "#4F46E5" : "#374151",
              "& .MuiListItemIcon-root": {
                color: activeMenu === "Projects" ? "#4F46E5" : "#374151",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary="Projects"
              primaryTypographyProps={{
                sx: { fontSize: "16px" },
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/mytasks"
            onClick={() => handleMenuClick("MyTasks")}
            sx={{
              color: activeMenu === "MyTasks" ? "#4F46E5" : "#374151",
              "& .MuiListItemIcon-root": {
                color: activeMenu === "MyTasks" ? "#4F46E5" : "#374151",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <FormatListBulletedIcon />
            </ListItemIcon>
            <ListItemText
              primary="My Tasks"
              primaryTypographyProps={{
                sx: { fontSize: "16px" },
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/calendar"
            onClick={() => handleMenuClick("Calendar")}
            sx={{
              color: activeMenu === "Calendar" ? "#4F46E5" : "#374151",
              "& .MuiListItemIcon-root": {
                color: activeMenu === "Calendar" ? "#4F46E5" : "#374151",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <CalendarTodayIcon />
            </ListItemIcon>
            <ListItemText
              primary="Calendar"
              primaryTypographyProps={{
                sx: { fontSize: "16px" },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Typography
        variant="subtitle2"
        sx={{
          color: "#6B7280",
          fontSize: "12px",
          mb: 1,
          textTransform: "uppercase",
        }}
      >
        Workspace
      </Typography>
      <List sx={{ p: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/messages"
            onClick={() => handleMenuClick("Messages")}
            sx={{
              color: activeMenu === "Messages" ? "#4F46E5" : "#374151",
              "& .MuiListItemIcon-root": {
                color: activeMenu === "Messages" ? "#4F46E5" : "#374151",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <ChatBubbleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Messages"
              primaryTypographyProps={{
                sx: { fontSize: "16px" },
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/documents"
            onClick={() => handleMenuClick("Documents")}
            sx={{
              color: activeMenu === "Documents" ? "#4F46E5" : "#374151",
              "& .MuiListItemIcon-root": {
                color: activeMenu === "Documents" ? "#4F46E5" : "#374151",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <InsertDriveFileIcon />
            </ListItemIcon>
            <ListItemText
              primary="Documents"
              primaryTypographyProps={{
                sx: { fontSize: "16px" },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
