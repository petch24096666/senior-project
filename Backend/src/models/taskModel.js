const Task = {
    getAllTask: "SELECT * FROM task",
    getTaskById: "SELECT * FROM task WHERE task_id = ?",
    createTask: "INSERT INTO task (task_label, task_name, task_description, task_due_date, task_assign, task_group, task_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
};

export default Task;
  
    