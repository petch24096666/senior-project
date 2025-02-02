const Project = {
  getById: "SELECT * FROM projects WHERE id = ?",
  getAllProjects: "SELECT * FROM projects",
  createProject: "INSERT INTO projects (title, description, tasksCompleted, totalTasks) VALUES (?, ?, ?, ?)",
  deleteProject: "DELETE FROM projects WHERE id = ?",
};

export default Project;

  