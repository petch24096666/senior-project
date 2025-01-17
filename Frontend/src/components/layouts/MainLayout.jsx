import React from "react";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import Sidebar from "./SideBar";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
