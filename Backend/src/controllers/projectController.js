// Mock Data
const projects = [
    { id: 1, title: 'Website Redesign', tasksCompleted: 24, totalTasks: 36 },
    { id: 2, title: 'Mobile App Development', tasksCompleted: 18, totalTasks: 30 },
  ];
  
  // Get All Projects
  const getAllProjects = (req, res) => {
    res.status(200).json({ success: true, data: projects });
  };
  
  // Create a New Project
  const createProject = (req, res) => {
    const { title, tasksCompleted, totalTasks } = req.body;
  
    const newProject = {
      id: projects.length + 1,
      title,
      tasksCompleted,
      totalTasks,
    };
  
    projects.push(newProject);
    res.status(201).json({ success: true, data: newProject });
  };
  
  module.exports = {
    getAllProjects,
    createProject,
  };
  