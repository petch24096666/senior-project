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
    // ✅ ดึงข้อมูล Project
    const [projectResults] = await db.query(Project.getById, [id]);
    if (!projectResults.length) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const project = projectResults[0];

    // ✅ ดึงข้อมูล Team Members ของโปรเจกต์
    const [membersResults] = await db.query("SELECT email, role FROM project_members WHERE project_id = ?", [id]);

    // ✅ รวมข้อมูลทั้งหมดเป็น JSON Response
    res.status(200).json({
      success: true,
      data: {
        id: project.id,
        title: project.title,
        description: project.description,
        teamMembers: membersResults || [],
      },
    });

  } catch (error) {
    console.error("Database error:", error);
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
  const { title, description, teamMembers } = req.body;

  console.log("Updating Project ID:", id);
  console.log("Request Body:", req.body);

  if (!id) {
    return res.status(400).json({ success: false, error: "Project ID is required" });
  }

  try {
    // อัปเดต Project Table
    const updateProjectQuery = "UPDATE projects SET title = ?, description = ? WHERE id = ?";
    await db.query(updateProjectQuery, [title, description, id]);

    // ลบ Team Members เดิมก่อน
    const deleteMembersQuery = "DELETE FROM project_members WHERE project_id = ?";
    await db.query(deleteMembersQuery, [id]);

    // เพิ่ม Team Members ใหม่
    if (teamMembers.length > 0) {
      const insertMembersQuery = "INSERT INTO project_members (project_id, email, role) VALUES ?";
      const memberValues = teamMembers.map((member) => [id, member.email, member.role]);
      await db.query(insertMembersQuery, [memberValues]);
    }

    console.log("Project Updated Successfully");
    res.status(200).json({ success: true, message: "Project updated successfully!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, error: "An error occurred while updating the project." });
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

