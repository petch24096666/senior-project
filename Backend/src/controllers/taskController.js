// controllers/taskController.js
import Task from '../models/taskModel.js';
import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    // Using promises/async-await
    const [results] = await db.query(Task.getAllTasks);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [results] = await db.query(Task.getTaskById, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req, res) => {
  try {
    // 1) ต้องดึงทุกฟิลด์ที่ต้องการจาก req.body
    const {
      title,
      description,
      priority,
      status,
      due_date,
      project_id,
      assignees
    } = req.body;

    // 2) ตรวจสอบว่ามี title จริงหรือไม่ (ถ้าต้องการให้ title เป็น required)
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // 3) Normalize assignees เป็น array เสมอ
    const list = Array.isArray(assignees)
      ? assignees
      : typeof assignees === 'string'
        ? assignees.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const assigneeString = list.join(',');

    // 4) สร้าง UUID ขึ้นมาเอง และเตรียม params ให้ตรงกับ SQL ของ TaskModel
    const taskId = uuidv4();
    const params = [
      taskId,
      title,
      description || '',
      priority    || 'low',
      status      || 'todo',
      due_date    || null,
      project_id,
      assigneeString
    ];

    await db.query(Task.createTask, params);

    // 6) ส่ง response กลับไป
    const newTask = {
      id:          taskId,
      title,
      description: description || '',
      priority:    priority    || 'low',
      status:      status      || 'todo',
      due_date:    due_date    || null,
      project_id,
      assignee:    assigneeString
    };

    return res.status(201).json(newTask);

  } catch (error) {
    console.error('Error creating task:', error);
    return res
      .status(500)
      .json({ error: 'Failed to create task: ' + error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title, description, priority,
      status, due_date,
      assignees, assignee
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Normalize assignees into array
    const list = Array.isArray(assignees)
      ? assignees
      : Array.isArray(assignee)
        ? assignee
        : typeof assignee === 'string'
          ? assignee.split(',').map(s => s.trim()).filter(Boolean)
          : [];

    const assigneeString = list.join(',');

    const sql = `
      UPDATE tasks
      SET title=?, description=?, priority=?, due_date=?, status=?, assignee=?
      WHERE id=?
    `;
    const params = [
      title,
      description || '',
      priority || 'low',
      due_date || null,
      status || 'todo',
      assigneeString,
      id
    ];

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      id,
      title,
      description: description || '',
      priority: priority || 'low',
      due_date: due_date || null,
      status: status || 'todo',
      assignee: assigneeString
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};


// Update only the column of a task (for drag and drop)
export const updateTaskColumn = async (req, res) => {
  try {
    const id = req.params.id;
    const { column } = req.body;
    
    if (!column) {
      return res.status(400).json({ error: 'Column is required' });
    }
    
    const [result] = await db.query(Task.updateTaskColumn, [column, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json({ id, column_status: column });
  } catch (error) {
    console.error('Error updating task column:', error);
    res.status(500).json({ error: 'Failed to update task column' });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const [result] = await db.query(
      "UPDATE tasks SET deleted_at = NOW() WHERE id = ?",
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found or already archived" });
    }
    
    return res.status(200).json({ message: "Task archived successfully" });
  } catch (error) {
    console.error("Error archiving task:", error);
    return res.status(500).json({ error: "Failed to archive task" });
  }
};


export const restoreTask = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query(
      "UPDATE tasks SET deleted_at = NULL WHERE id = ?",
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(200).json({ message: "Task restored successfully" });
  } catch (error) {
    console.error("Error restoring task:", error);
    res.status(500).json({ error: "Failed to restore task" });
  }
};

export const getTasksByProject = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      
      // Using promises/async-await
      const [results] = await db.query(Task.getTasksByProject, [projectId]);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      res.status(500).json({ error: 'Failed to fetch project tasks' });
    }
  };

  export const purgeTask = async (req, res) => {
    const { id } = req.params;
    try {
      // ตรวจสอบว่ามี task อยู่ในฐานข้อมูลที่ตรงกับ id หรือไม่
      const [existing] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
      if (!existing.length) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }
  
      // ลบ task ออกจากฐานข้อมูลอย่างถาวร
      const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }
      return res.status(200).json({ success: true, message: "Task purged successfully" });
    } catch (error) {
      console.error("Error purging task:", error);
      return res.status(500).json({ success: false, error: "Failed to purge task" });
    }
  };

  export const getArchivedTasks = async (req, res) => {
    try {
      const projectId = req.query.projectId;
      if (!projectId) {
        return res.status(400).json({ success: false, error: "Project ID is required" });
      }
      
      const sql = "SELECT * FROM tasks WHERE project_id = ? AND deleted_at IS NOT NULL";
      const [rows] = await db.query(sql, [projectId]);
      
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("Error fetching archived tasks:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch archived tasks" });
    }
  };
  
  