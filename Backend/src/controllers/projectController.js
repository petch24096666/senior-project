import db from "../config/database.js";
import Project from "../models/projectModel.js";

// ดึงข้อมูลโปรเจคทั้งหมด
export const getAllProjects = (req, res) => {
  db.query(Project.getAllProjects, (err, result) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.status(200).json({ success: true, data: result });
  });
};

// เพิ่มโปรเจคใหม่
export const createProject = (req, res) => {
  const { title, description, tasksCompleted, totalTasks, teamMembers } = req.body;

  if (!title || !description || totalTasks === undefined || !teamMembers || teamMembers.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid input data" });
  }

  const projectValues = [title, description, tasksCompleted || 0, totalTasks];

  db.query(Project.createProject, projectValues, (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database insert error" });
    }

    const projectId = result.insertId;
    const sqlMembers = "INSERT INTO project_members (project_id, email, role) VALUES ?";
    const memberValues = teamMembers.map((member) => [projectId, member.email, member.role]);

    db.query(sqlMembers, [memberValues], (err) => {
      if (err) {
        console.error("Error inserting members:", err);
        return res.status(500).json({ success: false, error: "Error adding members" });
      }
      res.status(201).json({ success: true, message: "Project created successfully" });
    });
  });
};

// อัปเดตข้อมูลโปรเจค
export const updateProject = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) return res.status(400).json({ success: false, error: "Project ID is required" });
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: "No valid fields provided for update" });

  const fieldsToUpdate = Object.keys(updates).map(field => `${field} = ?`).join(", ");
  const values = [...Object.values(updates), id];

  const sql = `UPDATE projects SET ${fieldsToUpdate} WHERE id = ?`;

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Database update error" });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: "Project not found" });

    res.status(200).json({ success: true, message: "Project updated successfully" });
  });
};

// ลบโปรเจค
export const deleteProject = (req, res) => {
  const { id } = req.params;

  db.query(Project.deleteProject, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database delete error" });
    }
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  });
};
