import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import db from "./config/database.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(userRoutes);
app.use(projectRoutes);
// ตรวจสอบการเชื่อมต่อฐานข้อมูล
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database successfully.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
