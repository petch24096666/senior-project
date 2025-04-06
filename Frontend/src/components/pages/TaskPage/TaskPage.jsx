import React, { useState } from 'react';

const TaskPage = () => {
  // Sample projects data
  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', color: '#3b82f6' },
    { id: 2, name: 'Mobile App Development', color: '#10b981' },
    { id: 3, name: 'Marketing Campaign', color: '#f59e0b' },
    { id: 4, name: 'Client Proposal', color: '#8b5cf6' },
    { id: 5, name: 'Product Launch', color: '#ef4444' }
  ]);

  // Sample tasks data
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Create wireframes for homepage', 
      description: 'Design wireframes for the new homepage layout based on client feedback',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2025-04-02',
      projectId: 1,
      assignee: 'You'
    },
    { 
      id: 2, 
      title: 'Implement user authentication', 
      description: 'Set up Firebase authentication for the mobile app',
      priority: 'high',
      status: 'not-started',
      dueDate: '2025-04-05',
      projectId: 2,
      assignee: 'You'
    },
    { 
      id: 3, 
      title: 'Write social media posts', 
      description: 'Create 10 social media posts for the upcoming campaign',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2025-04-01',
      projectId: 3,
      assignee: 'You'
    },
    { 
      id: 4, 
      title: 'Review design mockups', 
      description: 'Provide feedback on the new design mockups from the design team',
      priority: 'low',
      status: 'not-started',
      dueDate: '2025-04-10',
      projectId: 1,
      assignee: 'Michael Chen'
    },
    { 
      id: 5, 
      title: 'Prepare quarterly presentation', 
      description: 'Create slides for the quarterly review meeting',
      priority: 'medium',
      status: 'not-started',
      dueDate: '2025-04-08',
      projectId: 4,
      assignee: 'You'
    },
    { 
      id: 6, 
      title: 'Test app on different devices', 
      description: 'Test the app on iOS and Android devices to ensure compatibility',
      priority: 'low',
      status: 'in-progress',
      dueDate: '2025-04-15',
      projectId: 2,
      assignee: 'Sarah Johnson'
    },
    { 
      id: 7, 
      title: 'Prepare product launch email', 
      description: 'Draft the announcement email for the product launch',
      priority: 'high',
      status: 'not-started',
      dueDate: '2025-03-31',
      projectId: 5,
      assignee: 'You'
    },
    { 
      id: 8, 
      title: 'Create API documentation', 
      description: 'Document all API endpoints for the developer portal',
      priority: 'medium',
      status: 'completed',
      dueDate: '2025-03-28',
      projectId: 2,
      assignee: 'You'
    },
    { 
      id: 9, 
      title: 'Finalize budget proposal', 
      description: 'Complete the budget proposal for the client meeting',
      priority: 'high',
      status: 'not-started',
      dueDate: '2025-03-30',
      projectId: 4,
      assignee: 'You'
    },
    { 
      id: 10, 
      title: 'Design product landing page', 
      description: 'Create the design for the new product landing page',
      priority: 'medium',
      status: 'not-started',
      dueDate: '2025-04-12',
      projectId: 5,
      assignee: 'Jessica Williams'
    }
  ]);

  // State for filtering and sorting
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    projectId: '',
    dueDate: '',
    assignee: 'You'
  });

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    
    // Filter by priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    
    // Filter by project
    if (filterProject !== 'all' && task.projectId !== parseInt(filterProject)) return false;
    
    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Filter by completion status
    if (!showCompleted && task.status === 'completed') return false;
    
    return true;
  });

  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Group tasks by project
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const projectId = task.projectId;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(task);
    return acc;
  }, {});

  // Handle completing a task
  const handleCompleteTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'in-progress' : 'completed' } 
        : task
    ));
  };

  // Handle updating task
  const handleUpdateTask = () => {
    if (selectedTask) {
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? selectedTask 
          : task
      ));
      setSelectedTask(null);
    }
  };

  // Handle adding new task
  const handleAddTask = (e) => {
    e.preventDefault();
    
    const newTaskObj = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'not-started',
      dueDate: newTask.dueDate,
      projectId: parseInt(newTask.projectId),
      assignee: newTask.assignee
    };
    
    setTasks([...tasks, newTaskObj]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      projectId: '',
      dueDate: '',
      assignee: 'You'
    });
    setShowAddTask(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get project by ID
  const getProject = (projectId) => {
    return projects.find(project => project.id === projectId);
  };

  // Check if task is due soon (within 2 days)
  const isDueSoon = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  // Check if task is overdue
  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f7fb'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>My Tasks</h1>
        <button 
          style={{
            backgroundColor: 'white',
            color: '#3b82f6',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={() => setShowAddTask(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Task
        </button>
      </header>
      
      {/* Filters Section */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center' 
          }}>
            {/* Search input */}
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  width: '100%'
                }}
              />
              <svg 
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            
            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            {/* Priority filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            
            {/* Project filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            alignItems: 'center' 
          }}>
            {/* Show completed switch */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => setShowCompleted(!showCompleted)}
                style={{ cursor: 'pointer' }}
              />
              Show Completed
            </label>
            
            {/* Sort by selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white'
              }}
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Main Task List */}
      <div style={{ 
        flex: 1, 
        padding: '20px 24px',
        overflowY: 'auto'
      }}>
        {Object.keys(groupedTasks).length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginBottom: '16px', opacity: 0.5 }}
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <h3 style={{ margin: '0 0 8px 0' }}>No tasks match your filters</h3>
            <p style={{ margin: 0 }}>Try adjusting your filters or add a new task</p>
          </div>
        ) : (
          Object.keys(groupedTasks).map(projectId => {
            const project = getProject(parseInt(projectId));
            return (
              <div key={projectId} style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: project.color,
                    marginRight: '8px'
                  }}></div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {project.name}
                  </h2>
                  <span style={{ 
                    marginLeft: '8px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    {groupedTasks[projectId].length} tasks
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {groupedTasks[projectId].map(task => (
                    <div 
                      key={task.id} 
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        borderLeft: `4px solid ${project.color}`
                      }}
                      onClick={() => setSelectedTask(task)}
                    >
                      {/* Checkbox */}
                      <div style={{ 
                        minWidth: '24px'
                      }}>
                        <div 
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: task.status === 'completed' ? 'none' : '2px solid #d1d5db',
                            backgroundColor: task.status === 'completed' ? '#10b981' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTask(task.id);
                          }}
                        >
                          {task.status === 'completed' && (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      {/* Task content */}
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </h3>
                        <p style={{ 
                          margin: 0,
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {task.description.length > 100 
                            ? `${task.description.substring(0, 100)}...` 
                            : task.description}
                        </p>
                        
                        {/* Task meta info */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '4px',
                          fontSize: '12px'
                        }}>
                          {/* Priority badge */}
                          <span style={{
                            backgroundColor: getPriorityColor(task.priority),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'capitalize'
                          }}>
                            {task.priority}
                          </span>
                          
                          {/* Assignee */}
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#4b5563'
                          }}>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="12" 
                              height="12" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {task.assignee}
                          </span>
                          
                          {/* Due date */}
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isOverdue(task.dueDate) ? '#ef4444' : 
                                  isDueSoon(task.dueDate) ? '#f59e0b' : '#4b5563',
                            fontWeight: isOverdue(task.dueDate) || isDueSoon(task.dueDate) ? 'bold' : 'normal'
                          }}>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="12" 
                              height="12" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {isOverdue(task.dueDate) ? 'Overdue: ' : 
                             isDueSoon(task.dueDate) ? 'Due soon: ' : 'Due: '}
                            {formatDate(task.dueDate)}
                          </span>
                          
                          {/* Status badge */}
                          <span style={{
                            backgroundColor: task.status === 'completed' ? '#d1fae5' : 
                                          task.status === 'in-progress' ? '#dbeafe' : '#f3f4f6',
                            color: task.status === 'completed' ? '#10b981' : 
                                task.status === 'in-progress' ? '#3b82f6' : '#6b7280',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'capitalize'
                          }}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Task Details Modal */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: getProject(selectedTask.projectId).color 
                }}></div>
                <h3 style={{ margin: 0, color: '#1f2937' }}>
                  {getProject(selectedTask.projectId).name}
                </h3>
              </div>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setSelectedTask(null)}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={selectedTask.title}
                onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: 'none',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  borderBottom: '1px solid #e5e7eb'
                }}
              />
              
              <textarea
                value={selectedTask.description}
                onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  Priority
                </label>
                <select
                  value={selectedTask.priority}
                  onChange={(e) => setSelectedTask({...selectedTask, priority: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  Status
                </label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => setSelectedTask({...selectedTask, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={selectedTask.dueDate}
                  onChange={(e) => setSelectedTask({...selectedTask, dueDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  Assignee
                </label>
                <input
                  type="text"
                  value={selectedTask.assignee}
                  onChange={(e) => setSelectedTask({...selectedTask, assignee: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <button 
                onClick={() => {
                  setTasks(tasks.filter(task => task.id !== selectedTask.id));
                  setSelectedTask(null);
                }}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button 
                onClick={handleUpdateTask}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Add New Task</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setShowAddTask(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold' 
                }}>
                  Task Title
                </label>
                <input 
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold' 
                }}>
                  Description
                </label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}>
                    Project
                  </label>
                  <select
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}>
                    Due Date
                  </label>
                  <input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}>
                    Assignee
                  </label>
                  <input 
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;