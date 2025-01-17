import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import projectIcon from "../../assets/icons/project.png";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const TopBar = () => {
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
          <NotificationsNoneIcon sx={{ cursor: "pointer" }} />
          <AccountCircleIcon
            sx={{ cursor: "pointer", width: "32px", height: "32px" }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
