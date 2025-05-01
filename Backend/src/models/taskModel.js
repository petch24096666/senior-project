// models/Task.js
const Task = {
    // Change these queries to use the correct column names
    getAllTasks: "SELECT * FROM tasks ORDER BY created_at DESC",
    
    getTasksByProject: "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
    
    // Other queries remain the same
    getTaskById: "SELECT * FROM tasks WHERE id = ?",
    
    // Update this to include created_at and updated_at instead of createdAt/updatedAt
    createTask: `
    INSERT INTO tasks 
      (id, title, description, priority, status, due_date, project_id, assignee, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `,
    
    updateTask: "UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, assignee = ? WHERE id = ?",
    
    updateTaskColumn: "UPDATE tasks SET status = ? WHERE id = ?",
    
    deleteTask: "DELETE FROM tasks WHERE id = ?"
  };
  
  export default Task;