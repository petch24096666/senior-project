// projectRoutes.js  :contentReference[oaicite:1]{index=1}
import express from "express";
import { 
  getAllProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  getProjectById, 
  getProjectTaskCounts,
  getProjectUsers, 
  updateProjectUserRole,
  updateProjectStatus,
  getArchivedProjects,
  restoreProject,
  purgeProject
} from "../controllers/projectController.js";

const router = express.Router();

router.get('/api/projects/taskCounts', getProjectTaskCounts);

// Route ที่มี :project_id ควรอยู่หลัง route อื่น ๆ ที่ไม่ใช่ parameter
router.get('/api/projects', getAllProjects);
router.post('/api/projects', createProject);
router.put('/api/projects/:project_id', updateProject);
router.delete('/api/projects/:project_id', deleteProject);
router.get('/api/projects/:project_id', getProjectById);
router.get('/api/projects/:project_id/users', getProjectUsers);
router.put('/api/projects/:project_id/users/:user_id/role', updateProjectUserRole);
router.patch("/api/projects/:projectId/update-status", updateProjectStatus);
// ดึงโปรเจกต์ที่ถูก archive (deleted_at ไม่เป็น NULL)
router.get('/projects/archive', getArchivedProjects);

// Restore project (ตั้ง deleted_at กลับเป็น NULL)
router.patch('/projects/:project_id/restore', restoreProject);

// Purge project (ลบโปรเจกต์ออกจากฐานข้อมูลถาวร)
router.delete('/projects/:project_id/purge', purgeProject);


export default router;
