const Task = {
    createTask: "INSERT INTO task (task_label, task_name, task_description, task_due_date, task_assign, task_group) VALUES (?, ?, ?, ?, ?, ?)",
};

export default Task;
  
    