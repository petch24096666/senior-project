// routes/taskRoutes.js
import express from "express";
import { 
  getAllTasks, 
  getTaskById, 
  getTasksByProject, 
  createTask, 
  updateTask, 
  updateTaskColumn, 
  deleteTask,
  restoreTask,
  purgeTask,
  getArchivedTasks
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
// Tasks Archive Routes (ถ้าต้องการให้มีแยกสำหรับ task)
router.get('/tasks/archive', getArchivedTasks);
// Restore task
router.patch('/tasks/:id/restore', restoreTask);

// Purge task
router.delete('/tasks/:id/purge', purgeTask);

export default router;