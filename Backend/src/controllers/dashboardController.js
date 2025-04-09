import db from "../config/database.js";
import Project from "../models/projectModel.js";

/**
 * Controller สำหรับดึงข้อมูลโปรเจกต์และสมาชิกทีมทั้งหมดสำหรับหน้า Dashboard
 * โดยดึงโปรเจกต์ที่ผู้ใช้เป็น creator หรือเป็นสมาชิกในโปรเจกต์
 */
export const getDashboardProjects = async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ success: false, error: "User ID is required" });
  }
  
  try {
    // ดึงโปรเจกต์ที่ผู้ใช้เป็น creator หรือเป็นสมาชิก และ active (deleted_at IS NULL)
    const sql = `
      SELECT DISTINCT p.*
      FROM projects p
      LEFT JOIN projectmembers pm ON p.project_id = pm.project_id
      WHERE (p.creator_id = ? OR pm.user_id = ?)
        AND p.deleted_at IS NULL
    `;
    const [rows] = await db.query(sql, [userId, userId]);
    
    if (!rows.length) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    // Map ข้อมูลพื้นฐานของโปรเจกต์
    const projects = rows.map(project => ({
      ...project,
      id: project.project_id,
      name: project.title,
      status: project.status || "In Progress",
      dueDate: project.due_date,
      startDate: project.start_date,
      tasks: project.tasks_completed,
      totalTasks: project.total_tasks,
      team: [] // จะเติมข้อมูลสมาชิกทีมในภายหลัง
    }));
    
    // ดึงสมาชิกทีมสำหรับโปรเจกต์ทั้งหมด
    const projectIds = projects.map(p => p.project_id);
    const placeholders = projectIds.map(() => '?').join(',');
    const [teamRows] = await db.query(
      `
      SELECT project_id, email, role, user_id 
      FROM projectmembers 
      WHERE project_id IN (${placeholders})
      `,
      projectIds
    );
    
    // Group สมาชิกทีมตาม project_id
    const teamsByProject = {};
    teamRows.forEach(member => {
      if (!teamsByProject[member.project_id]) {
        teamsByProject[member.project_id] = [];
      }
      teamsByProject[member.project_id].push({
        email: member.email,
        role: member.role,
        user_id: member.user_id
      });
    });
    
    // Map สมาชิกทีมเข้ากับแต่ละโปรเจกต์
    projects.forEach(project => {
      if (teamsByProject[project.project_id]) {
        project.team = teamsByProject[project.project_id];
      }
    });
    
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching dashboard projects:", error);
    return res.status(500).json({ success: false, error: "Database query error" });
  }
};

export const getActiveTasksCount = async (req, res) => {
  const { userEmail } = req.query;
  
  if (!userEmail) {
    return res.status(400).json({ success: false, error: "User email is required" });
  }
  
  try {
    const sql = `
      SELECT 
        COUNT(*) AS totalTasks,
        SUM(CASE WHEN status = 'completed' OR status = 'done' THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN status != 'completed' AND status != 'done' THEN 1 ELSE 0 END) AS activeTasks
      FROM tasks
      WHERE FIND_IN_SET(?, assignee) > 0 
        AND deleted_at IS NULL
    `;
    const [rows] = await db.query(sql, [userEmail]);
    
    const totalTasks = rows[0].totalTasks || 0;
    const completedTasks = rows[0].completedTasks || 0;
    const activeTasks = rows[0].activeTasks || 0;
    
    return res.status(200).json({ 
      success: true, 
      data: { totalTasks, completedTasks, activeTasks } 
    });
  } catch (error) {
    console.error("Error fetching active tasks count:", error);
    return res.status(500).json({ success: false, error: "Database query error" });
  }
};


export const getAssignedTasks = async (req, res) => {
  const { userEmail } = req.query;
  
  if (!userEmail) {
    return res.status(400).json({ success: false, error: "User email is required" });
  }
  
  try {
    console.log("Searching for tasks assigned to:", userEmail);
    
    const sql = `
      SELECT t.*, p.title as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE FIND_IN_SET(LOWER(TRIM(?)), LOWER(TRIM(t.assignee))) > 0
        AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC, 
               CASE 
                 WHEN t.priority = 'High' THEN 1
                 WHEN t.priority = 'Medium' THEN 2
                 WHEN t.priority = 'Low' THEN 3
                 ELSE 4
               END
      LIMIT 10
    `;
    
    const normalizedEmail = userEmail.trim().toLowerCase();
    console.log("Executing query:", sql.replace('?', `'${normalizedEmail}'`));
    
    const [rows] = await db.query(sql, [normalizedEmail]);
    
    console.log("Query returned", rows.length, "rows");
    console.log("First few results:", rows.slice(0, 2));
    
    if (rows.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: "No tasks found for this user" 
      });
    }
    
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    return res.status(500).json({ success: false, error: "Database query error" });
  }
};

  
  