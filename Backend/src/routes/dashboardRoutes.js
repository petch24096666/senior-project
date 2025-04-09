// dashboardRoutes.js  :contentReference[oaicite:0]{index=0}
import express from "express";
import { getDashboardProjects, getActiveTasksCount, getAssignedTasks} from "../controllers/dashboardController.js";

const router = express.Router();

// เส้นทางสำหรับ Dashboard เมื่อถูก mount ด้วย prefix "/api/dashboard"
router.get("/", getDashboardProjects);
router.get('/active-tasks', getActiveTasksCount);
router.get('/assigned-tasks', getAssignedTasks);

export default router;
