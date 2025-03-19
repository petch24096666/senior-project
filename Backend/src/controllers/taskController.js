import db from "../config/database.js";
import Task from "../models/taskModel.js";

export const getAllTask = async (req, res) => {
    try {
      const [rows] = await db.query(Task.getAllTask);
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ success: false, error: "Database query error" });
    }
  };
  // ดึงข้อมูลโปรเจค by ID
  export const getTaskById = async (req, res) => {
    const { task_id } = req.params;
  
    if (!task_id) {
      return res.status(400).json({ success: false, error: "Task ID is required." });
    }
  
    try {
      // ✅ ดึงข้อมูล Task
      const [taskResults] = await db.query(Task.getById, [task_id]);
      if (!taskResults.length) {
        return res.status(404).json({ success: false, error: "Task not found." });
      }
  
      const task = taskResults[0];
  
      // ✅ รวมข้อมูลทั้งหมดเป็น JSON Response
      res.status(200).json({
        success: true,
        data: {
          task_id: task.id,
          task_label: task.lebal,
          task_name: task.name,
          task_description: task.description,
          task_due_date: task.duedate,
          task_group: task.group,
          task_status: task.status
        },
      });
  
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ success: false, error: "An error occurred while fetching the task." });
    }
  };

  export const createTask = async (req, res) => {
    const { task_label, task_name, task_description, task_due_date, task_group } = req.body;

    if (!task_label || !task_name || !task_due_date || !task_group) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        const task_status = "To Do"; // กำหนดค่าเริ่มต้นให้ task_status เป็น "To Do"
        const [result] = await db.query(
            "INSERT INTO task (task_label, task_name, task_description, task_due_date, task_group, task_status) VALUES (?, ?, ?, ?, ?, ?)",
            [task_label, task_name, task_description || "", task_due_date, task_group, task_status]
        );

        return res.status(201).json({ success: true, message: "Task created successfully", taskId: result.insertId });
    } catch (error) {
        console.error("🔥 Database Insert Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
export const updateTaskStatus = async (req, res) => {
    const { task_status } = req.body;
    const { task_id } = req.params;

    if (!task_status) {
        return res.status(400).json({ success: false, error: "Task status is required." });
    }

    try {
        const [result] = await db.query("UPDATE task SET task_status = ? WHERE task_id = ?", [task_status, task_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Task not found." });
        }

        return res.status(200).json({ success: true, message: "Task status updated successfully." });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ success: false, error: "Failed to update task status." });
    }
};