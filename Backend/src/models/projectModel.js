const Project = {
    createProject: "INSERT INTO projects (title, description, tasksCompleted, totalTasks) VALUES (?, ?, ?, ?)",
    getAllProjects: "SELECT * FROM projects",
    deleteProject: "DELETE FROM projects WHERE id = ?",
  };
  
  export default Project;
  