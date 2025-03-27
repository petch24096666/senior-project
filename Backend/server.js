import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import db from "./src/config/database.js";
import calendarRoutes from "./src/routes/calendarRoutes.js";
import { google } from "googleapis";



dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(userRoutes);
app.use(projectRoutes);
app.use(taskRoutes);
app.use("/api",calendarRoutes);

// ทดสอบการเชื่อมต่อฐานข้อมูล (Optional)
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("Connected to MySQL database successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

