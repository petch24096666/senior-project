import express from "express";
import { getAllProjects, createProject, updateProject, deleteProject, getProjectById, getProjectTaskCounts,getProjectUsers, updateProjectUserRole,updateProjectStatus} from "../controllers/projectController.js";

const router = express.Router();

router.get('/api/projects/taskCounts', getProjectTaskCounts);

// 2) จากนั้นจึงประกาศ route ที่มี :project_id
router.get('/api/projects/:project_id', getProjectById);

// 3) Route อื่น ๆ
router.get('/api/projects', getAllProjects);
router.post('/api/projects', createProject);
router.put('/api/projects/:project_id', updateProject);
router.delete('/api/projects/:project_id', deleteProject);
router.get('/api/projects/:project_id/users', getProjectUsers);
router.put('/api/projects/:project_id/users/:user_id/role', updateProjectUserRole);
router.patch("/api/projects/:projectId/update-status", updateProjectStatus);


export default router;
