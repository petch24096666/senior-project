import express from "express";
import { getAllProjects, createProject, updateProject, deleteProject, getProjectById } from "../controllers/projectController.js";

const router = express.Router();

router.get("/api/projects", getAllProjects);
router.get("/api/projects/:id", getProjectById);
router.post("/api/projects", createProject);
router.put("/api/projects/:id", updateProject);
router.delete("/api/projects/:id", deleteProject);

export default router;
