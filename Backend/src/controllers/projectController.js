import db from "../config/database.js";
import Project from "../models/projectModel.js";

// ดึงข้อมูลโปรเจคทั้งหมดสำหรับ user ที่ล็อกอิน
export const getAllProjects = async (req, res) => {
  const userId = req.query.userId;
  try {
    let rows = [];
    if (userId) {
      const sql = `
        SELECT DISTINCT p.*
        FROM projects p
        LEFT JOIN projectmembers pm ON p.project_id = pm.project_id
        WHERE p.creator_id = ? OR pm.user_id = ?
      `;
      [rows] = await db.query(sql, [userId, userId]);
    } else {
      [rows] = await db.query(Project.getAllProjects);
    }
    if (rows.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    const projects = rows.map(project => ({
      ...project,
      tasks: project.tasks_completed,
      totalTasks: project.total_tasks,
      dueDate: project.due_date,
      startDate: project.start_date,
      team: []
    }));
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ success: false, error: "Database query error" });
  }
};

// ดึงโปรเจคตาม ID
export const getProjectById = async (req, res) => {
  const { project_id } = req.params; // เปลี่ยนจาก id เป็น project_id
  if (!project_id)
    return res.status(400).json({ success: false, error: "Project ID is required." });
  try {
    const [projectResults] = await db.query(Project.getById, [project_id]);
    if (!projectResults.length) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }
    const project = projectResults[0];
    const [membersResults] = await db.query(
      "SELECT email, role, user_id FROM projectmembers WHERE project_id = ?",
      [project_id]
    );
    return res.status(200).json({
      success: true,
      data: {
        project_id: project.project_id,
        title: project.title,
        tasks: project.tasks_completed,
        totalTasks: project.total_tasks,
        due_date: project.due_date,
        category: project.category,
        priority: project.priority,
        team: membersResults || []
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ success: false, error: "An error occurred while fetching the project." });
  }
};


// สร้างโปรเจคใหม่
export const createProject = async (req, res) => {
  const { project_id, title, category, startdate,duedate, priority, creator_id, team } = req.body;
  const totalTasks = 0;
  const tasksCompleted = 0;

  if (!project_id || !title || !category || startdate === '' || duedate === '' || !priority || !creator_id || !team || team.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid input data" });
  }
  

  try {
    // ตรวจสอบสมาชิกทีม
    for (const member of team) {
      const [userRows] = await db.query("SELECT user_id FROM users WHERE email = ?", [member.email]);
      if (userRows.length === 0) {
        return res.status(400).json({ success: false, error: `User not found: ${member.email}` });
      }
      member.user_id = userRows[0].user_id;
    }

    await db.query(
      "INSERT INTO projects (project_id, title, category, start_date, due_date, priority, tasks_completed, total_tasks, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [project_id, title, category, startdate, duedate, priority, tasksCompleted, totalTasks, creator_id]
    );

    if (team.length > 0) {
      const sqlMembers = "INSERT INTO projectmembers (project_member_id, project_id, email, role, user_id) VALUES ?";
      const memberValues = team.map((member) => [
        crypto.randomUUID(), // สร้าง UUID สำหรับ project_member_id
        project_id,
        member.email,
        member.role,
        member.user_id
      ]);
      await db.query(sqlMembers, [memberValues]);
    }

    return res.status(201).json({ success: true, message: "Project created successfully" });
  } catch (error) {
    console.error("Error inserting project:", error);
    return res.status(500).json({ success: false, error: "Database insert error" });
  }
};

// อัปเดตโปรเจค
export const updateProject = async (req, res) => {
  const { project_id } = req.params;    // เปลี่ยนจาก id เป็น project_id
  const { title, team } = req.body;
  if (!project_id) {
    return res.status(400).json({ success: false, error: "Project ID is required" });
  }
  try {
    // อัปเดตชื่อโปรเจค
    const updateProjectQuery = "UPDATE projects SET title = ? WHERE project_id = ?";
    await db.query(updateProjectQuery, [title, project_id]);

    // ลบสมาชิกเดิมทั้งหมด
    const deleteMembersQuery = "DELETE FROM projectmembers WHERE project_id = ?";
    await db.query(deleteMembersQuery, [project_id]);

    // เพิ่มสมาชิกใหม่ (ถ้ามี)
    if (Array.isArray(team) && team.length > 0) {
      const memberValues = [];
      for (const member of team) {
        // ตรวจสอบ user_id จาก email
        const [userRows] = await db.query(
          "SELECT user_id FROM users WHERE email = ?",
          [member.email]
        );
        if (userRows.length === 0) {
          return res.status(400).json({ success: false, error: `User not found: ${member.email}` });
        }
        memberValues.push([
          crypto.randomUUID(),
          project_id,
          member.email,
          member.role,
          userRows[0].user_id
        ]);
      }
      const insertMembersQuery =
        "INSERT INTO projectmembers (project_member_id, project_id, email, role, user_id) VALUES ?";
      await db.query(insertMembersQuery, [memberValues]);
    }

    return res.status(200).json({ success: true, message: "Project updated successfully!" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ success: false, error: "An error occurred while updating the project." });
  }
};

// ลบโปรเจค
export const deleteProject = async (req, res) => {
  const { project_id } = req.params;   // เปลี่ยนจาก id เป็น project_id
  try {
    const [result] = await db.query(
      "DELETE FROM projects WHERE project_id = ?",
      [project_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Database delete error:", error);
    return res.status(500).json({ success: false, error: "Database delete error" });
  }
};

export const getProjectTaskCounts = async (req, res) => {
  const userId = req.query.userId;
  try {
    const sql = `
      SELECT
        p.project_id,
        COUNT(DISTINCT t.id) AS totalTasks,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) AS tasksCompleted
      FROM projects p
      LEFT JOIN projectmembers pm ON p.project_id = pm.project_id
      LEFT JOIN tasks t         ON p.project_id = t.project_id
      WHERE p.creator_id = ? OR pm.user_id = ?
      GROUP BY p.project_id
    `;
    const [rows] = await db.query(sql, [userId, userId]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch task counts" });
  }
};


