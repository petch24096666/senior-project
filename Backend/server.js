import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import db from "./src/config/database.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// ✅ แก้ไข: เพิ่ม `/api` เพื่อให้เส้นทาง API ถูกต้อง
app.use(userRoutes);
app.use(projectRoutes);

// ตรวจสอบการเชื่อมต่อฐานข้อมูล
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database successfully.");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
