import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import db from "./src/config/database.js";
import calendarRoutes from "./src/routes/calendarRoutes.js";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// ✅ ต้องอยู่ก่อนทุกอย่าง
app.use(cors());
app.use(express.json());

// Database connection test
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("Connected to MySQL database successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

// ✅ ใส่ auth middleware หลัง cors
app.use(async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ message: "Invalid token" });

  req.user = data.user;
  next();
});

// Routes
app.use(userRoutes);
app.use(projectRoutes);
app.use(calendarRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
