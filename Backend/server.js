import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import db from "./src/config/database.js";
import { google } from "googleapis";
import taskRoutes from "./src/routes/taskRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import bookingRoutes from './src/routes/bookingRoutes.js';
import bookedRoutes from "./src/routes/bookedRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Routes
app.use(userRoutes);
app.use(projectRoutes);
app.use(taskRoutes);
app.use('/api', commentRoutes);
app.use('/api', bookingRoutes);
app.use("/api", bookedRoutes);

// Mount dashboardRoutes ด้วย prefix "/api/projects/dashboard"
// จากนั้น URL ที่ใช้จะเป็น http://localhost:8081/api/projects/dashboard?userId=xxx
app.use("/api/dashboard", dashboardRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));


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
