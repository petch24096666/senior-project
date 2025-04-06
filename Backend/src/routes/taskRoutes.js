// routes/taskRoutes.js
import express from "express";
import { 
  getAllTasks, 
  getTaskById, 
  getTasksByProject, 
  createTask, 
  updateTask, 
  updateTaskColumn, 
  deleteTask 
} from "../controllers/taskController.js";

const router = express.Router();

// Existing routes
router.get("/api/tasks", getAllTasks);
router.get("/api/tasks/:id", getTaskById);
router.post("/api/tasks", createTask);
router.put("/api/tasks/:id", updateTask);
router.patch("/api/tasks/:id/column", updateTaskColumn);
router.delete("/api/tasks/:id", deleteTask);

// New route for project-specific tasks
router.get("/api/projects/:projectId/tasks", getTasksByProject);

export default router;