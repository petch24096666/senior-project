const db = require('../config/database'); // เรียกใช้การเชื่อมต่อฐานข้อมูล MySQL

// ดึงข้อมูลโปรเจคทั้งหมดจากฐานข้อมูล
const getAllProjects = (req, res) => {
  const sql = "SELECT id, title, description, tasksCompleted, totalTasks FROM projects";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ success: false, error: "Database query error" });
    }
    res.status(200).json({ success: true, data: result });
  });
};


// เพิ่มโปรเจคใหม่ลงในฐานข้อมูล
const createProject = (req, res) => {
  const { title, description, tasksCompleted, totalTasks } = req.body;

  if (!title || !description || totalTasks === undefined) {
    return res.status(400).json({ success: false, error: "Title, description, and totalTasks are required" });
  }

  const sql = "INSERT INTO projects (`title`, `description`, `tasksCompleted`, `totalTasks`) VALUES (?, ?, ?, ?)";
  const values = [title, description, tasksCompleted || 0, totalTasks];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database insert error" });
    }
    res.status(201).json({ success: true, data: { id: result.insertId, title, description, tasksCompleted, totalTasks } });
  });
};

// อัปเดตข้อมูลโปรเจค
const updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description, tasksCompleted, totalTasks } = req.body;

  if (!title || !description || totalTasks === undefined) {
    return res.status(400).json({ success: false, error: "Title, description, and totalTasks are required" });
  }

  const sql = "UPDATE projects SET title = ?, description = ?, tasksCompleted = ?, totalTasks = ? WHERE id = ?";
  const values = [title, description, tasksCompleted, totalTasks, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating project:", err);
      return res.status(500).json({ success: false, error: "Database update error" });
    }
    res.status(200).json({ success: true, message: "Project updated successfully" });
  });
};


// ลบโปรเจค
const deleteProject = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting project:", err);
      return res.status(500).json({ success: false, error: "Database delete error" });
    }
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  });
};

module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
};
