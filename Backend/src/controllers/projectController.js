import db from "../config/database.js";
import Project from "../models/projectModel.js";

// ดึงข้อมูลโปรเจคทั้งหมด
export const getAllProjects = async (req, res) => {
  try {
    const [rows] = await db.query(Project.getAllProjects);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, error: "Database query error" });
  }
};
// ดึงข้อมูลโปรเจค by ID
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, error: "Project ID is required." });
  }

  try {
    const [rows] = await db.query(Project.getById, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ success: false, error: "An error occurred while fetching the project." });
  }
};


// เพิ่มโปรเจคใหม่
export const createProject = async (req, res) => {
  const { title, description, tasksCompleted, totalTasks, teamMembers } = req.body;

  if (!title || !description || totalTasks === undefined || !teamMembers || teamMembers.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid input data" });
  }

  try {
    console.log("Inserting project into database...");

    const [result] = await db.query(
      "INSERT INTO projects (title, description, tasksCompleted, totalTasks) VALUES (?, ?, ?, ?)",
      [title, description, tasksCompleted || 0, totalTasks]
    );

    const projectId = result.insertId;
    console.log(`Project inserted with ID: ${projectId}`);

    if (teamMembers.length > 0) {
      const sqlMembers = "INSERT INTO project_members (project_id, email, role) VALUES ?";
      const memberValues = teamMembers.map((member) => [projectId, member.email, member.role]);

      await db.query(sqlMembers, [memberValues]);
      console.log(`Inserted ${teamMembers.length} team members`);
    }

    console.log("Sending response...");
    return res.status(201).json({ success: true, message: "Project created successfully" });
  } catch (error) {
    console.error("Error inserting project:", error);
    return res.status(500).json({ success: false, error: "Database insert error" });
  }
};



// อัปเดตข้อมูลโปรเจค
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) return res.status(400).json({ success: false, error: "Project ID is required" });
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: "No valid fields provided for update" });

  try {
    const fieldsToUpdate = Object.keys(updates).map(field => `${field} = ?`).join(", ");
    const values = [...Object.values(updates), id];

    const sql = `UPDATE projects SET ${fieldsToUpdate} WHERE id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project updated successfully" });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ success: false, error: "Database update error" });
  }
};

// ลบโปรเจค
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(Project.deleteProject, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Database delete error:", error);
    res.status(500).json({ success: false, error: "Database delete error" });
  }
};

