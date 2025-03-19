import express from "express";
import { getAllTask, getTaskById, createTask } from "../controllers/taskController.js";

const router = express.Router();

router.get("/api/task", getAllTask);
router.post("/api/task", createTask);
router.get("/api/projects/:task_id", getTaskById);

export default router;
