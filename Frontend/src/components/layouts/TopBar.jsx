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
  Menu,
  MenuItem,
} from "@mui/material";
import projectIcon from "../../assets/icons/project.png";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import axios

const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081"; // ✅ ตรวจสอบค่า URL

const TopBar = () => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // ✅ Mock Data สำหรับการแจ้งเตือน
  const notifications = [
    { id: 1, message: "New message from John", time: "5 mins ago", type: "message" },
    { id: 2, message: "Project deadline approaching", time: "1 day ago", type: "alert" },
    { id: 3, message: "You have been invited to Project Alpha", time: "2 hours ago", type: "invitation" },
  ];

  // เปิดเมนูแจ้งเตือน
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // ปิดเมนูแจ้งเตือน
  const handleClose = () => {
    setAnchorEl(null);
  };

  // เปิด Dropdown Profile
  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  // ปิด Dropdown Profile
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  // ไปที่หน้าโปรไฟล์
  const handleEditProfile = () => {
    navigate("/profile");
    handleProfileClose();
  };

  // ✅ ฟังก์ชัน Logout
  const handleLogout = async () => {
    try {
        const authToken = localStorage.getItem("authToken"); // ✅ ตรวจสอบ Token
        
        if (!authToken) {
            console.warn("No authToken found. Redirecting to home.");
            navigate("/", { replace: true });
            return;
        }

        // ✅ เรียก API Logout และส่ง Token ไป
        const response = await axios.post(`${url}/api/logout`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log("Logout Response:", response.data); // ✅ Debugging Log

        // ✅ ล้างข้อมูล Authentication
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authSession");
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // ✅ ป้องกันการย้อนกลับ (Block Back Button)
        window.history.pushState(null, "", "/");
        window.history.replaceState(null, "", "/");

        // ✅ บังคับป้องกัน Back Button
        window.onpopstate = () => {
            window.history.pushState(null, "", "/");
        };

        // ✅ เปลี่ยนเส้นทางไปหน้าแรก และบังคับไม่ให้ย้อนกลับ
        navigate("/", { replace: true });
    } catch (error) {
        console.error("Logout Error:", error);
        alert("Logout failed. Please try again.");
    } finally {
        handleProfileClose();
    }
};



  const open = Boolean(anchorEl);
  const profileOpen = Boolean(profileAnchorEl);
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
          {/* 🔔 ปุ่มแจ้งเตือน */}
          <IconButton onClick={handleNotificationClick}>
            <NotificationsNoneIcon sx={{ cursor: "pointer" }} />
          </IconButton>

          {/* 👤 ปุ่ม Profile Dropdown */}
          <IconButton onClick={handleProfileClick}>
            <AccountCircleIcon sx={{ cursor: "pointer", width: "32px", height: "32px" }} />
          </IconButton>

          {/* Dropdown Menu สำหรับ Profile */}
          <Menu
            anchorEl={profileAnchorEl}
            open={profileOpen}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem> {/* ✅ เพิ่ม Logout */}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
