import React, { useState } from 'react';

const Dashboard = () => {
  // State for active date in calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState([
    { 
      id: 1, 
      name: 'Website Redesign', 
      status: 'In Progress', 
      progress: 65, 
      dueDate: '2025-04-15',
      team: [
        { id: 1, name: 'Sarah Miller', avatar: '/api/placeholder/30/30' },
        { id: 2, name: 'John Cooper', avatar: '/api/placeholder/30/30' },
        { id: 3, name: 'Alex Wong', avatar: '/api/placeholder/30/30' }
      ]
    },
    { 
      id: 2, 
      name: 'Mobile App Design', 
      status: 'Planning', 
      progress: 25, 
      dueDate: '2025-05-10',
      team: [
        { id: 2, name: 'John Cooper', avatar: '/api/placeholder/30/30' },
        { id: 4, name: 'Maria Garcia', avatar: '/api/placeholder/30/30' }
      ]
    },
    { 
      id: 3, 
      name: 'API Integration', 
      status: 'Completed', 
      progress: 100, 
      dueDate: '2025-03-22',
      team: [
        { id: 5, name: 'David Kim', avatar: '/api/placeholder/30/30' },
        { id: 1, name: 'Sarah Miller', avatar: '/api/placeholder/30/30' }
      ]
    }
  ]);
  
  const [activities, setActivities] = useState([
    { id: 1, user: 'Sarah Miller', action: 'completed the task', subject: 'Update homepage hero section', time: '2 hours ago' },
    { id: 2, user: 'John Cooper', action: 'added a comment on', subject: 'Mobile App Design', time: '4 hours ago' },
    { id: 3, user: 'Alex Wong', action: 'created a new task', subject: 'API Documentation', time: '1 day ago' },
    { id: 4, user: 'Maria Garcia', action: 'updated the status of', subject: 'User Testing', time: '2 days ago' }
  ]);
  
  const [upcomingTasks, setUpcomingTasks] = useState([
    { id: 1, title: 'Review design system documentation', priority: 'High', dueDate: '2025-03-31', completed: false },
    { id: 2, title: 'Team meeting - Sprint planning', priority: 'Medium', dueDate: '2025-04-01', completed: false },
    { id: 3, title: 'Complete user flow diagrams', priority: 'Medium', dueDate: '2025-04-02', completed: false },
    { id: 4, title: 'Finalize API specifications', priority: 'High', dueDate: '2025-04-03', completed: false }
  ]);

  // State for hover effects
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Calendar navigation
  const nextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date);
  };

  const prevMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date);
  };

  // Format month name and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Get days in month for calendar
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const daysArray = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ day: '', date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      daysArray.push({ 
        day: i, 
        date: date,
        isToday: new Date().toDateString() === date.toDateString(),
        hasEvent: i === 15 || i === 22 || i === 29 // Dummy event days
      });
    }
    
    return daysArray;
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setUpcomingTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          marginBottom: '8px',
          color: '#111827'
        }}>Welcome back!</h1>
        <p style={{ 
          color: '#6b7280', 
          margin: 0 
        }}>Here's what's happening with your projects today.</p>
      </header>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Project Stats */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: hoveredCard === 'projects' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.12)',
          padding: '16px',
          transition: 'box-shadow 0.3s ease-in-out'
        }}
        onMouseEnter={() => setHoveredCard('projects')}
        onMouseLeave={() => setHoveredCard(null)}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            color: '#4b5563',
            fontWeight: 500
          }}>
            <span>Total Projects</span>
            <div style={{ 
              width: '40px',
              height: '40px',
              backgroundColor: '#e6f7ff',
              color: '#0072e5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span role="img" aria-label="folder">📁</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              marginRight: '12px'
            }}>{projects.length}</h2>
            <span style={{ 
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor: '#dcfce7',
              color: '#16a34a'
            }}>↑ 12% from last month</span>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: hoveredCard === 'tasks' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.12)',
          padding: '16px',
          transition: 'box-shadow 0.3s ease-in-out'
        }}
        onMouseEnter={() => setHoveredCard('tasks')}
        onMouseLeave={() => setHoveredCard(null)}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            color: '#4b5563',
            fontWeight: 500
          }}>
            <span>Active Tasks</span>
            <div style={{ 
              width: '40px',
              height: '40px',
              backgroundColor: '#f3e8ff',
              color: '#9333ea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span role="img" aria-label="clock">⏰</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              marginRight: '12px'
            }}>{upcomingTasks.length}</h2>
            <span style={{ 
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor: '#dcfce7',
              color: '#16a34a'
            }}>↑ 8% from last week</span>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: hoveredCard === 'calendar' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.12)',
          padding: '16px',
          transition: 'box-shadow 0.3s ease-in-out'
        }}
        onMouseEnter={() => setHoveredCard('calendar')}
        onMouseLeave={() => setHoveredCard(null)}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            color: '#4b5563',
            fontWeight: 500
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span role="img" aria-label="calendar">📅</span>
              {formatMonthYear(currentMonth)}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={prevMonth} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: hoveredDay === 'prev' ? '#f3f4f6' : 'transparent'
                }}
                onMouseEnter={() => setHoveredDay('prev')}
                onMouseLeave={() => setHoveredDay(null)}
              >◀</button>
              <button 
                onClick={nextMonth} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: hoveredDay === 'next' ? '#f3f4f6' : 'transparent'
                }}
                onMouseEnter={() => setHoveredDay('next')}
                onMouseLeave={() => setHoveredDay(null)}
              >▶</button>
            </div>
          </div>
          
          <div style={{ marginTop: '8px' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} style={{ 
                  textAlign: 'center',
                  padding: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6b7280'
                }}>
                  {day}
                </div>
              ))}
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}>
              {getDaysInMonth(currentMonth).map((day, i) => (
                <div 
                  key={i} 
                  style={{ 
                    textAlign: 'center',
                    padding: '6px',
                    position: 'relative',
                    backgroundColor: day.isToday ? '#2563eb' : (hoveredDay === i && day.day) ? '#f3f4f6' : 'transparent',
                    color: day.isToday ? 'white' : 'inherit',
                    borderRadius: (day.isToday || (hoveredDay === i && day.day)) ? '50%' : 'none',
                    fontWeight: day.hasEvent ? 500 : 400,
                    cursor: day.day ? 'pointer' : 'default',
                    visibility: day.day ? 'visible' : 'hidden'
                  }}
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {day.day}
                  {day.hasEvent && <div style={{ 
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#2563eb',
                    borderRadius: '50%',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Projects Table */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: 700,
            margin: 0
          }}>Recent Projects</h2>
          <button style={{ 
            backgroundColor: '#eff6ff',
            color: '#3b82f6',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>View All</button>
        </div>
        
        {projects.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#4b5563',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>Project Name</th>
                  <th style={{ 
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#4b5563',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>Status</th>
                  <th style={{ 
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#4b5563',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>Progress</th>
                  <th style={{ 
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#4b5563',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>Due Date</th>
                  <th style={{ 
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#4b5563',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>Team</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr 
                    key={project.id} 
                    style={{
                      transition: 'background-color 0.2s',
                      backgroundColor: hoveredRow === project.id ? '#f9fafb' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredRow(project.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={{ 
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 500
                    }}>{project.name}</td>
                    <td style={{ 
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: project.status === 'In Progress' ? '#e6f7ff' : 
                                        project.status === 'Planning' ? '#f3e8ff' : 
                                        project.status === 'Completed' ? '#dcfce7' : 
                                        project.status === 'On Hold' ? '#fef9c3' : '#f3f4f6',
                        color: project.status === 'In Progress' ? '#0072e5' : 
                              project.status === 'Planning' ? '#9333ea' : 
                              project.status === 'Completed' ? '#16a34a' : 
                              project.status === 'On Hold' ? '#ca8a04' : '#4b5563'
                      }}>
                        {project.status}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          height: '6px',
                          width: '100%',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          marginRight: '8px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            height: '100%',
                            width: `${project.progress}%`,
                            borderRadius: '3px',
                            backgroundColor: project.progress < 30 ? '#ef4444' : 
                                            project.progress < 70 ? '#f59e0b' : '#10b981'
                          }}></div>
                        </div>
                        <span style={{ 
                          fontSize: '14px',
                          color: '#4b5563'
                        }}>{project.progress}%</span>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {new Date(project.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ 
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {project.team.slice(0, 3).map((member, index) => (
                          <div 
                            key={member.id} 
                            style={{ 
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e5e7eb',
                              border: '2px solid white',
                              overflow: 'hidden',
                              position: 'relative',
                              zIndex: project.team.length - index,
                              marginLeft: index > 0 ? '-8px' : '0'
                            }}
                          >
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              style={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }} 
                            />
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e5e7eb',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4b5563',
                            fontSize: '12px',
                            fontWeight: 500,
                            marginLeft: '-8px'
                          }}>
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '32px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p>No projects available</p>
          </div>
        )}
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
        gap: '16px'
      }}>
        {/* Activity Feed */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          height: '100%'
        }}>
          <div style={{ 
            padding: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 700,
              margin: 0
            }}>Recent Activity</h2>
          </div>
          
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {activities.map((activity, index) => (
              <li 
                key={activity.id} 
                style={{ 
                  padding: '12px 16px',
                  transition: 'background-color 0.2s',
                  backgroundColor: hoveredActivity === activity.id ? '#f9fafb' : 'transparent'
                }}
                onMouseEnter={() => setHoveredActivity(activity.id)}
                onMouseLeave={() => setHoveredActivity(null)}
              >
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                  }}>
                    <span style={{ fontWeight: 500 }}>{activity.user}</span>
                    <span style={{ color: '#6b7280' }}>{activity.action}</span>
                    <span style={{ 
                      fontWeight: 500,
                      color: '#2563eb',
                      cursor: 'pointer',
                      textDecoration: hoveredActivity === activity.id ? 'underline' : 'none'
                    }}>{activity.subject}</span>
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>{activity.time}</div>
                </div>
                {index < activities.length - 1 && (
                  <div style={{ 
                    marginTop: '12px',
                    borderBottom: '1px solid #e5e7eb'
                  }}></div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Upcoming Tasks */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          height: '100%'
        }}>
          <div style={{ 
            padding: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: 700,
              margin: 0
            }}>Upcoming Tasks</h2>
          </div>
          
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {upcomingTasks.map((task, index) => (
              <li 
                key={task.id} 
                style={{ 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  transition: 'background-color 0.2s',
                  backgroundColor: hoveredTask === task.id ? '#f9fafb' : 'transparent'
                }}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  style={{ 
                    marginTop: '3px',
                    marginRight: '12px'
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ 
                      fontWeight: 500,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? '#9ca3af' : 'inherit'
                    }}>
                      {task.title}
                    </span>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: task.priority === 'High' ? '#fee2e2' : 
                                      task.priority === 'Medium' ? '#fef9c3' : 
                                      task.priority === 'Low' ? '#dcfce7' : '#f3f4f6',
                      color: task.priority === 'High' ? '#dc2626' : 
                            task.priority === 'Medium' ? '#ca8a04' : 
                            task.priority === 'Low' ? '#16a34a' : '#4b5563'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '4px'
                  }}>
                    <span role="img" aria-label="calendar" style={{ fontSize: '16px' }}>📅</span>
                    Due {new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;