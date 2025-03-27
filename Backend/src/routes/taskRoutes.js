import express from "express";
import { getAllTask, getTaskById, createTask, updateTaskStatus} from "../controllers/taskController.js";

const router = express.Router();

router.get("/api/task", getAllTask);
router.get("/api/task/:task_id", getTaskById);
router.post("/api/task", createTask);
router.put("/api/task/:task_id", updateTaskStatus);

export default router;
