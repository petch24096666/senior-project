// controllers/taskController.js
import Task from '../models/taskModel.js';
import db from '../config/database.js';

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

// Create a new task
// controllers/taskController.js
export const createTask = async (req, res) => {
  try {
    const {
      title, description, priority,
      status, due_date, project_id,
      assignees, assignee
    } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
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

    const params = [
      title,
      description || '',
      priority || 'low',
      status || 'todo',
      due_date || null,
      project_id,
      assigneeString
    ];

    const [result] = await db.query(Task.createTask, params);

    const newTask = {
      id: result.insertId,
      title,
      description: description || '',
      priority: priority || 'low',
      status: status || 'todo',
      due_date: due_date || null,
      project_id,
      assignee: assigneeString
    };

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task: ' + error.message });
  }
};

// Update an existing task
// ตัวอย่างปรับ updateTask โดยใช้ due_date และ status (แทน dueDate และ column)
// Controller
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
    const id = req.params.id;
    
    const [result] = await db.query(Task.deleteTask, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
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