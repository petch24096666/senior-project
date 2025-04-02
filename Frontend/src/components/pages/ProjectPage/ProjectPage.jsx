import React, { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../../../context/Usercontext';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// Custom CSS keyframes for animations
const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ProjectDashboard = () => {
  // ดึงข้อมูลผู้ใช้จาก context
  const { customUser } = useContext(UserContext);
  if (!customUser) {
    return <div>Please log in to view your projects.</div>;
  }
  const currentUserId = customUser.user_id; // ดึง user_id จากตาราง users
  // Project data
  const [projects, setProjects] = useState([]);
  // State variables
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // ปรับ state ใหม่ ไม่รวม tasks fields และ description
  const [newProject, setNewProject] = useState({
    project_id: uuidv4(),
    title: '',
    category: '',
    startdate: '',
    duedate: '',
    priority: '',
    team: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: '0/0',
    highPriorityCount: 0,
    dueThisWeek: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch projects
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8081/api/projects?userId=${currentUserId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const normalized = data.data.map(project => ({
            ...project,
            duedate: project.due_date // ✅ convert to camelCase
          }));
          setProjects(normalized);
          console.log("📌 Projects Normalized:", normalized);
        } else {
          setProjects([]);
          setError(data.error || "No projects found");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentUserId]);


  // Memoized filter function
  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(project => {
        return project.title.toLowerCase().includes(term) ||
          project.category.toLowerCase().includes(term) ||
          (project.team && project.team.some(member => member.toLowerCase().includes(term)));
      });
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory]);

  // Run filter and update stats when projects change
  useEffect(() => {
    filterProjects();
    updateStats();
  }, [filterProjects, projects]);

  // Handle search input keypress
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      filterProjects();
    }
  };

  // Update dashboard statistics
  const updateStats = useCallback(() => {
    const totalProjects = projects.length;
    // เนื่องจาก tasks จะถูกรับค่ามาจาก Kanban ในอนาคต เราจึงใช้ค่า default 0
    const completedTasks = projects.reduce((sum, project) => sum + (project.tasks || 0), 0);
    const totalTasks = projects.reduce((sum, project) => sum + (project.totalTasks || 0), 0);
    const completedTasksString = `${completedTasks}/${totalTasks}`;

    const highPriorityCount = projects.filter(project => project.priority === 'high').length;

    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const dueThisWeek = projects.filter(project => {
      const dueDate = new Date(project.duedate);
      return dueDate >= today && dueDate <= oneWeekLater;
    }).length;

    setStats({
      totalProjects,
      completedTasks: completedTasksString,
      highPriorityCount,
      dueThisWeek
    });
  }, [projects]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No Due Date';
    const date = dayjs(dateString);
    if (!date.isValid()) return 'No Due Date';
    return date.format('MMM D, YYYY'); // Apr 30, 2025
  };


  // Capitalize first letter
  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Generate team avatars for grid view
  const generateAvatars = (team, category) => {
    const maxDisplayed = 3;
    const displayedTeam = team.slice(0, maxDisplayed);
    const extraMembers = team.length > maxDisplayed ? team.length - maxDisplayed : 0;

    return (
      <>
        {displayedTeam.map((member, index) => (
          <div
            key={index}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: index === 0 ? '0' : '-8px',
              transition: 'transform 0.2s',
              backgroundColor: getCategoryColor(category, 'bg'),
              color: getCategoryColor(category, 'text'),
              zIndex: displayedTeam.length - index
            }}
          >
            {member.charAt(0)}
          </div>
        ))}
        {extraMembers > 0 && (
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: '-8px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              zIndex: 0
            }}
          >
            +{extraMembers}
          </div>
        )}
      </>
    );
  };

  // Generate team avatars for list view
  const generateListAvatars = (team, category) => {
    const maxDisplayed = 2;
    const displayedTeam = team.slice(0, maxDisplayed);
    const extraMembers = team.length > maxDisplayed ? team.length - maxDisplayed : 0;

    return (
      <>
        {displayedTeam.map((member, index) => (
          <div
            key={index}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: index === 0 ? '0' : '-6px',
              backgroundColor: getCategoryColor(category, 'bg'),
              color: getCategoryColor(category, 'text'),
              zIndex: displayedTeam.length - index
            }}
          >
            {member.charAt(0)}
          </div>
        ))}
        {extraMembers > 0 && (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: '-6px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              zIndex: 0
            }}
          >
            +{extraMembers}
          </div>
        )}
      </>
    );
  };

  // Get color based on category
  const getCategoryColor = (category, type) => {
    const colors = {
      design: { bg: '#eff0ff', text: '#4f46e5', header: '#4f46e5' },
      development: { bg: '#e0f7ff', text: '#0ea5e9', header: '#0ea5e9' },
      marketing: { bg: '#f3f0ff', text: '#8b5cf6', header: '#8b5cf6' },
      operations: { bg: '#fce7f3', text: '#ec4899', header: '#ec4899' }
    };
    return colors[category] ? colors[category][type] : '#cbd5e0';
  };

  // Get priority badge styles
  const getPriorityStyles = (priority) => {
    const styles = {
      high: { bg: '#FEE2E2', text: '#DC2626' },
      medium: { bg: '#FEF3C7', text: '#D97706' },
      low: { bg: '#ECFDF5', text: '#059669' }
    };
    return styles[priority] || { bg: '#E5E7EB', text: '#4B5563' };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const mapping = {
      projectTitle: 'title',
      projectCategory: 'category',
      projectStartDate: 'startdate',
      projectDueDate: 'duedate',
      projectPriority: 'priority',
      projectTeam: 'team'
    };
    const field = mapping[id];
    if (field) {
      setNewProject(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };


  // Validate form before saving
  const validateForm = () => {
    const { title, category, duedate, priority } = newProject;
    if (!title || !category || duedate === '' || !priority) {
      alert('Please fill out all required fields');
      return false;
    }
    return true;
  };

  // Save new project
  // ตัวอย่างส่วนของ saveProject ใน ProjectDashboard.jsx
  const saveProject = () => {
    if (!validateForm()) return;

    let teamMembers = [];
    if (newProject.team) {
      teamMembers = newProject.team
        .split(',')
        .map(email => ({ email: email.trim(), role: 'member' }));
    }

    const creatorEmail = customUser.email;
    const isCreatorInTeam = teamMembers.some(member => member.email === creatorEmail);
    if (!isCreatorInTeam) {
      teamMembers.push({ email: creatorEmail, role: 'creator' });
    }

    const projectData = {
      project_id: newProject.project_id,
      title: newProject.title,
      category: newProject.category,
      startdate: newProject.startdate,
      duedate: newProject.duedate,
      priority: newProject.priority,
      team: teamMembers, // ✅
      creator_id: currentUserId
    };

    console.log("Sending project:", projectData); // ✅ เช็ก log

    fetch("http://localhost:8081/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData)
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          fetch(`http://localhost:8081/api/projects?userId=${currentUserId}`)
            .then(response => response.json())
            .then(data => setProjects(data.data));
          closeModal();
          alert("Project added successfully!");
        } else {
          alert("Error creating project: " + result.error);
        }
      })
      .catch(error => console.error("Error:", error));
  };




  // Delete project functionality
  const deleteProject = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      fetch(`http://localhost:8081/api/projects/${id}`, {
        method: "DELETE"
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            setProjects(prev => prev.filter(project => project.project_id !== id)); // ใช้ project_id ถูกต้องแล้ว
          } else {
            console.error("Delete error:", result.error);
          }
        })
        .catch(error => console.error("Error deleting project:", error));
    }
  };


  // Open/close modal functions
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewProject({
      project_id: uuidv4(), // ✅ reset ใหม่
      title: '',
      category: '',
      duedate: '',
      priority: '',
      team: ''
    });
  };


  // Render grid view
  const renderGridView = () => {
    if (filteredProjects.length === 0) {
      return (
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            color: '#4a5568',
            fontSize: '18px',
            marginBottom: '12px'
          }}>No projects found</h3>
          <p style={{
            color: '#718096',
            marginBottom: '24px'
          }}>Try adjusting your search or filter criteria</p>
          <button
            onClick={resetFilters}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return filteredProjects.map(project => {
      const progress = Math.round((project.tasks / project.totalTasks) * 100);
      const formattedDate = formatDate(project.duedate);
      return (
        <div
          key={project.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: hoveredCard === project.id
              ? '0 12px 20px rgba(0,0,0,0.1)'
              : '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            transform: hoveredCard === project.id ? 'translateY(-5px)' : 'translateY(0)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #f1f1f1',
            animation: 'fadeIn 0.5s ease-out',
            zIndex: hoveredCard === project.id ? 1 : 0
          }}
          onMouseEnter={() => setHoveredCard(project.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div
            style={{
              height: '6px',
              backgroundColor: getCategoryColor(project.category, 'header')
            }}
          ></div>
          <div
            style={{
              padding: '24px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: hoveredCard === project.id ? '#4f46e5' : '#1a202c',
                  transition: 'color 0.2s'
                }}
              >
                {project.title}
              </h3>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.project_id);
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      style={{
                        width: '4px',
                        height: '4px',
                        backgroundColor: '#718096',
                        borderRadius: '50%'
                      }}
                    ></span>
                  ))}
                </button>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                padding: '5px 12px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 500,
                alignItems: 'center',
                marginBottom: '20px',
                width: 'fit-content',
                backgroundColor: getCategoryColor(project.category, 'bg'),
                color: getCategoryColor(project.category, 'text')
              }}
            >
              <span
                style={{
                  marginRight: '6px',
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getCategoryColor(project.category, 'text')
                }}
              ></span>
              {capitalize(project.category)}
            </span>

            <div
              style={{
                marginBottom: '20px',
                marginTop: 'auto'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}
              >
                <span style={{ color: '#718096', fontWeight: 500 }}>
                  Progress
                </span>
                <span style={{ fontWeight: 600, color: '#2d3748' }}>
                  {project.tasks}/{project.totalTasks}
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#edf2f7', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                  width: `${progress}%`,
                  backgroundColor: getCategoryColor(project.category, 'header')
                }}></div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#718096',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500
              }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  display: 'inline-block',
                  backgroundColor: '#718096',
                  maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E")`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center'
                }}></span>
                {formatDate(project.duedate)}
              </span>
              <div style={{ display: 'flex' }}>
                {generateAvatars(project.team, project.category)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  // Render list view (ไม่ซ้ำกับ grid มากนัก)
  const renderListView = () => {
    if (filteredProjects.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#4a5568', fontSize: '18px', marginBottom: '12px' }}>No projects found</h3>
          <p style={{ color: '#718096', marginBottom: '24px' }}>Try adjusting your search or filter criteria</p>
          <button
            onClick={resetFilters}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return filteredProjects.map(project => {
      const progress = Math.round((project.tasks / project.totalTasks) * 100);
      const formattedDate = formatDate(project.duedate);
      const priorityStyles = getPriorityStyles(project.priority);
      return (
        <div
          key={project.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          <div style={{
            width: '12px',
            height: '30px',
            borderRadius: '6px',
            backgroundColor: getCategoryColor(project.category, 'header')
          }}>
          </div>
          <h3 style={{ fontWeight: 600, fontSize: '16px', flex: 1 }}>
            {project.title}
          </h3>
          <span style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: 500,
            width: '120px',
            textAlign: 'center',
            backgroundColor: getCategoryColor(project.category, 'bg'),
            color: getCategoryColor(project.category, 'text')
          }}>
            {capitalize(project.category)}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '180px'
          }}>
            <div style={{
              flex: 1,
              height: '6px',
              backgroundColor: '#edf2f7',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
                width: `${progress}%`,
                backgroundColor: getCategoryColor(project.category, 'header')
              }}>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {progress}%
            </span>
          </div>
          <span style={{ fontSize: '13px', color: '#718096', width: '100px' }}>
            {formattedDate}
          </span>
          <div style={{ display: 'flex', width: '100px' }}>
            {generateListAvatars(project.team, project.category)}
          </div>
          <span style={{
            display: 'inline-flex',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 600,
            width: '80px',
            justifyContent: 'center',
            backgroundColor: priorityStyles.bg,
            color: priorityStyles.text
          }}>
            {capitalize(project.priority)}
          </span>
          <button style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}>
            {[1, 2, 3].map(i => (
              <span key={i} style={{
                width: '4px',
                height: '4px',
                backgroundColor: '#718096',
                borderRadius: '50%'
              }}>
              </span>
            ))}
          </button>
        </div>
      );
    });
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      color: '#333',
      padding: '20px',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{fadeInKeyframes}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eaeaea'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>Projects</h1>
            <p style={{ color: '#718096', marginTop: '5px', fontSize: '16px' }}>
              Get an overview of your projects and track progress.
            </p>
          </div>
          <button
            onClick={openModal}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '15px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(79, 70, 229, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#4338ca';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 10px rgba(79, 70, 229, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.1)';
            }}
          >
            + Add Project
          </button>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          marginBottom: '25px',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{
            display: 'flex',
            flex: 1,
            maxWidth: '500px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
            <button
              onClick={filterProjects}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '0 20px',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}
            >
              Search
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              display: 'flex',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  backgroundColor: viewMode === 'grid' ? '#f0f0ff' : 'white',
                  border: 'none',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'grid' ? 600 : 500,
                  color: viewMode === 'grid' ? '#4f46e5' : '#718096',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (viewMode !== 'grid') { e.currentTarget.style.backgroundColor = '#f9fafb'; }
                }}
                onMouseOut={(e) => {
                  if (viewMode !== 'grid') { e.currentTarget.style.backgroundColor = 'white'; }
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  backgroundColor: viewMode === 'list' ? '#f0f0ff' : 'white',
                  border: 'none',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'list' ? 600 : 500,
                  color: viewMode === 'list' ? '#4f46e5' : '#718096',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (viewMode !== 'list') { e.currentTarget.style.backgroundColor = '#f9fafb'; }
                }}
                onMouseOut={(e) => {
                  if (viewMode !== 'list') { e.currentTarget.style.backgroundColor = 'white'; }
                }}
              >
                List
              </button>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                outline: 'none',
                color: '#4a5568',
                fontWeight: 500,
                minWidth: '160px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}
            >
              <option value="all">All Categories</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
            </select>
          </div>
        </div>

        {/* Projects View (Grid or List) */}
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {renderGridView()}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {renderListView()}
          </div>
        )}

        {/* Stats Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
          marginTop: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #f1f1f1'
          }}>
            <div style={{
              marginBottom: '12px',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#4f46e5'
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>Total Projects</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.totalProjects}</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #f1f1f1'
          }}>
            <div style={{
              marginBottom: '12px',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0ea5e9'
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>Completed Tasks</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.completedTasks}</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #f1f1f1'
          }}>
            <div style={{
              marginBottom: '12px',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#8b5cf6'
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>High Priority</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.highPriorityCount}</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #f1f1f1'
          }}>
            <div style={{
              marginBottom: '12px',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ec4899'
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>Due This Week</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.dueThisWeek}</div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          zIndex: 100,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: '500px',
            animation: 'fadeIn 0.3s'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a202c' }}>Add New Project</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <form>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="projectTitle">
                    Project Title
                  </label>
                  <input
                    type="text"
                    id="projectTitle"
                    value={newProject.title || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="projectCategory">
                    Category
                  </label>
                  <select
                    id="projectCategory"
                    value={newProject.category || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="design">Design</option>
                    <option value="development">Development</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="projectStartDate">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="projectStartDate"
                    value={newProject.startdate || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="projectDueDate">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="projectDueDate"
                    value={newProject.duedate || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="projectPriority">
                    Priority
                  </label>
                  <select
                    id="projectPriority"
                    value={newProject.priority || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="projectTeam">
                    Team Members (comma separated)
                  </label>
                  <input
                    type="text"
                    id="projectTeam"
                    placeholder="e.g. Alex, Jamie, Taylor"
                    value={newProject.team || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </form>
            </div>
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
