import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/Usercontext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const ctx = useContext(UserContext);
  const currentUserId = ctx?.customUser?.user_id;
  const currentUserEmail = ctx?.customUser?.email;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: '0/0',
    highPriorityCount: 0,
    dueThisWeek: 0,

  });
  const [taskStats, setTaskStats] = useState({
    activeTasksCount: 0,
    completedTasksCount: 0,
    totalTasksCount: 0
  });
  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);


  const processTeamData = (team) => {
    if (!team) return [];
    const getInitials = (nameOrEmail) => {
      if (!nameOrEmail) return '?';
      if (nameOrEmail.includes('@')) {
        const username = nameOrEmail.split('@')[0];
        const initials = username
          .split(/[^a-zA-Z]/)
          .filter(part => part.length > 0)
          .map(part => part[0].toUpperCase())
          .slice(0, 2)
          .join('');

        return initials || username[0]?.toUpperCase() || '?';
      }
      const parts = nameOrEmail.split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return nameOrEmail[0]?.toUpperCase() || '?';
    };
    if (Array.isArray(team)) {
      return team.map(member => {
        const email = typeof member === 'object' ? member.email : member;
        const name = typeof member === 'object' ? (member.name || member.email) : member;

        return {
          id: email,
          name: name,
          initials: getInitials(name),
        };
      });
    }
    if (typeof team === 'string') {
      return team.split(',').map(email => ({
        id: email.trim(),
        name: email.trim(),
        initials: getInitials(email.trim()),
      }));
    }
    if (typeof team === 'object' && team !== null) {
      return Object.values(team).map(member => {
        const email = typeof member === 'object' ? member.email : member;
        const name = typeof member === 'object' ? (member.name || member.email) : member;

        return {
          id: email,
          name: name,
          initials: getInitials(name),
        };
      });
    }
    return [];
  };

  const fetchProjectsAndCounts = useCallback(async () => {
    if (!currentUserId) return;
  
    try {
      setLoading(true);
      const projRes = await axios.get(`${API_BASE_URL}/api/dashboard?userId=${currentUserId}`);
      const projectsData = projRes.data.data.map(p => {
        return {
          ...p,
          id: p.project_id,
          name: p.title,
          status: p.status || 'In Progress',
          progress: 0,
          dueDate: p.due_date ? p.due_date.split(' ')[0] : '',
          startdate: p.start_date ? p.start_date.split(' ')[0] : '', // ใช้เป็นวันที่สร้าง
          tasks: 0,
          totalTasks: 0,
          team: processTeamData(p.team)
        };
      });
  
      const countsRes = await axios.get(`${API_BASE_URL}/api/projects/taskCounts?userId=${currentUserId}`);
      const counts = countsRes.data.data;
  
      const merged = projectsData.map(p => {
        const c = counts.find(x => x.project_id === p.project_id);
        const totalTasks = c?.totalTasks || 0;
        const tasksCompleted = c?.tasksCompleted || 0;
        const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
  
        return {
          ...p,
          totalTasks,
          tasks: tasksCompleted,
          progress
        };
      });
  
      // เรียงลำดับ projects โดยใช้วันที่ใน property startdate (ใหม่สุดก่อน)
      merged.sort((a, b) => new Date(b.startdate) - new Date(a.startdate));
  
      setProjects(merged);
      updateStats(merged);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, API_BASE_URL]);
  

  const fetchMyTasks = useCallback(async () => {
    if (!currentUserEmail) return;
    
    try {
      setLoadingTasks(true);      
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/assigned-tasks?userEmail=${currentUserEmail}`);
      if (res.data.success) {
        const formattedTasks = res.data.data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority || 'Medium',
          dueDate: task.due_date,
          projectId: task.project_id,
          projectName: task.project_name || 'Unknown Project'
        }));
        
        setMyTasks(formattedTasks);
      } else {
        console.warn("API call successful but returned error:", res.data.error);
      }
    } catch (error) {
      console.error("Error fetching my tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  }, [API_BASE_URL, currentUserEmail]);
  
  useEffect(() => {
    if (currentUserEmail) {
      fetchMyTasks();
      const intervalId = setInterval(fetchMyTasks, 30000);
      return () => clearInterval(intervalId);
    }
  }, [currentUserEmail, fetchMyTasks]);

  const goToTask = (projectId) => {
    navigate(`/task/${projectId}`);
  };

  // Update dashboard statistics
  const updateStats = useCallback((projectsData) => {
    const totalProjects = projectsData.length;
    const completedTasks = projectsData.reduce((sum, project) => sum + (project.tasks || 0), 0);
    const totalTasks = projectsData.reduce((sum, project) => sum + (project.totalTasks || 0), 0);
    const completedTasksString = `${completedTasks}/${totalTasks}`;

    const highPriorityCount = projectsData.filter(project => project.priority === 'high').length;

    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const dueThisWeek = projectsData.filter(project => {
      const dueDate = new Date(project.dueDate);
      return dueDate >= today && dueDate <= oneWeekLater;
    }).length;

    setStats({
      totalProjects,
      completedTasks: completedTasksString,
      highPriorityCount,
      dueThisWeek
    });
  }, []);

  // Fetch projects on component mount
  useEffect(() => {
    if (currentUserId) {
      fetchProjectsAndCounts();
      const intervalId = setInterval(fetchProjectsAndCounts, 30000);
      return () => clearInterval(intervalId);
    }
  }, [currentUserId, fetchProjectsAndCounts]);

  const fetchActiveTasksCount = useCallback(async () => {
    if (!currentUserEmail) return;
    try {

      const res = await axios.get(`${API_BASE_URL}/api/dashboard/active-tasks?userEmail=${currentUserEmail}`);

      if (res.data.success) {
        const data = res.data.data;
        const totalTasks = data.totalTasks || 0;
        const tasksCompleted = data.completedTasks || 0; // Note: check if this field name matches your API
        const activeTasks = data.activeTasks || 0; // Get activeTasks directly from API

        // Update the separate task stats state
        const newTaskStats = {
          activeTasksCount: activeTasks,
          completedTasksCount: tasksCompleted,
          totalTasksCount: totalTasks
        };
        setTaskStats(newTaskStats);
      } else {
        console.warn("API call successful but returned error:", res.data.error);
      }
    } catch (error) {
      console.error("Error fetching active tasks count:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data
      });
    }
  }, [API_BASE_URL, currentUserEmail]);

  // ตัวอย่างการเรียกใช้งาน fetchActiveTasksCount พร้อมกับการเรียกข้อมูล projects ที่มีอยู่แล้ว
  useEffect(() => {
    if (currentUserEmail) {
      fetchActiveTasksCount();
      const intervalId = setInterval(fetchActiveTasksCount, 30000);
      return () => clearInterval(intervalId);
    }
  }, [currentUserEmail, fetchActiveTasksCount]);


// ฟังก์ชัน Calendar navigation (เหมือนเดิม)
const nextMonth = () => {
  setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
};

const prevMonth = () => {
   setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
};

// ฟังก์ชัน Format month/year (เหมือนเดิม)
const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// ฟังก์ชัน Get days in month (เหมือนเดิม)
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const daysArray = [];
  // Add empty cells for padding before the first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push({ day: '', date: null, isToday: false, hasEvent: false });
  }
  // Add actual days of the month
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    daysArray.push({
      day: i,
      date: dateObj,
      isToday: dateObj.toDateString() === today.toDateString(),
      // *** หมายเหตุ: hasEvent ยังเป็น Static ต้องแก้ถ้าต้องการแสดง Event จริง ***
      hasEvent: i % 7 === 0 // ตัวอย่าง: ใส่จุดทุกวันที่ 7
    });
  }
  // Add empty cells for padding after the last day to fill the grid (optional)
  // while (daysArray.length % 7 !== 0) {
  //    daysArray.push({ day: '', date: null, isToday: false, hasEvent: false });
  // }
  return daysArray;
};

  // Calendar integration placeholder functions
  const connectGoogleCalendar = () => {
    console.log("Trigger OAuth flow for Google Calendar");
  };

  const connectMicrosoftCalendar = () => {
    console.log("Trigger OAuth flow for Microsoft Calendar");
  };

  // Navigate to project page
  const goToProjectsPage = () => {
    navigate('/projects');
  };

  // Navigate to specific project
  const goToProject = (projectId) => {
    navigate(`/task/${projectId}`);
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

      {/* Calendar Connection Buttons */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <button
          onClick={connectGoogleCalendar}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Connect Google Calendar
        </button>
        <button
          onClick={connectMicrosoftCalendar}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Connect Microsoft Calendar
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Project Stats */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: hoveredCard === 'projects' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.12)',
            padding: '16px',
            transition: 'box-shadow 0.3s ease-in-out, transform 0.3s',
            transform: hoveredCard === 'projects' ? 'translateY(-4px)' : 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setHoveredCard('projects')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={goToProjectsPage}
        >
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
            }}>{stats.totalProjects}</h2>
            <span style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor: '#dcfce7',
              color: '#16a34a'
            }}>View Projects Page</span>
          </div>
        </div>
        {/* Active Tasks Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: hoveredCard === 'tasks' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.12)',
          padding: '16px',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s',
          transform: hoveredCard === 'tasks' ? 'translateY(-4px)' : 'translateY(0)'
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
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              marginRight: '12px'
            }}>{taskStats.activeTasksCount}</h2>
            <span style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor: '#f3e8ff',
              color: '#9333ea'
            }}>Tasks in Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Completed: </span>
              <span style={{
                color: '#16a34a',
                fontWeight: 500
              }}>{taskStats.completedTasksCount || 0}</span>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Total: </span>
              <span style={{ fontWeight: 500 }}>{taskStats.totalTasksCount || 0}</span>
            </div>
          </div>
        </div>

        <div
          style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: hoveredCard === 'calendar' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.12)', padding: '16px', transition: 'box-shadow 0.3s ease-in-out' }}
          onMouseEnter={() => setHoveredCard('calendar')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#4b5563', fontWeight: 500 }}>
            {/* Month/Year Display */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span role="img" aria-label="calendar">📅</span>
              {formatMonthYear(currentMonth)}
            </span>
             {/* Prev/Next Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: hoveredDay === 'prev' ? '#f3f4f6' : 'transparent' }} onMouseEnter={() => setHoveredDay('prev')} onMouseLeave={() => setHoveredDay(null)}>◀</button>
              <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: hoveredDay === 'next' ? '#f3f4f6' : 'transparent' }} onMouseEnter={() => setHoveredDay('next')} onMouseLeave={() => setHoveredDay(null)}>▶</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ marginTop: '8px' }}>
            {/* Weekday Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '6px', fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>{day}</div>
              ))}
            </div>
            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {getDaysInMonth(currentMonth).map((dayInfo, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: 'center',
                    padding: '6px',
                    position: 'relative',
                    width: '32px', // Fixed width for day cell
                    height: '32px', // Fixed height for day cell
                    display: 'flex', // Center content
                    alignItems: 'center', // Center content
                    justifyContent: 'center', // Center content
                    backgroundColor: dayInfo.isToday ? '#2563eb' : (hoveredDay === i && dayInfo.day) ? '#f3f4f6' : 'transparent',
                    color: dayInfo.isToday ? 'white' : 'inherit',
                    borderRadius: '50%', // Make it circular
                    fontWeight: dayInfo.isToday ? 600 : (dayInfo.hasEvent ? 500 : 400),
                    cursor: dayInfo.day ? 'pointer' : 'default',
                    visibility: dayInfo.day ? 'visible' : 'hidden', // Hide padding days
                    transition: 'background-color 0.2s' // Smooth hover effect
                  }}
                  onMouseEnter={() => dayInfo.day && setHoveredDay(i)} // Hover only on valid days
                  onMouseLeave={() => setHoveredDay(null)}
                  // --- [เพิ่ม onClick Handler ตรงนี้] ---
                  onClick={() => {
                    if (dayInfo.date instanceof Date && !isNaN(dayInfo.date)) {
                      const year = dayInfo.date.getFullYear();
                      const month = (dayInfo.date.getMonth() + 1).toString().padStart(2, '0');
                      const dateOfMonth = dayInfo.date.getDate().toString().padStart(2, '0');
                      const dateString = `${year}-${month}-${dateOfMonth}`;
                      // สมมติว่า Route ของ Calendar Page คือ /calendar
                      navigate(`/calendar?date=${dateString}`);
                    }
                  }}
                  // --- [สิ้นสุด onClick Handler] ---
                >
                  {dayInfo.day}
                  {/* Event Indicator Dot (Static for now) */}
                  {dayInfo.hasEvent && <div style={{ position: 'absolute', width: '4px', height: '4px', backgroundColor: dayInfo.isToday ? 'white' : '#2563eb', borderRadius: '50%', bottom: '4px', left: '50%', transform: 'translateX(-50%)' }}></div>}
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
          <button
            onClick={goToProjectsPage}
            style={{
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            View All
          </button>
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
                {projects.slice(0, 3).map((project) => (
                  <tr
                    key={project.id}
                    style={{
                      transition: 'background-color 0.2s',
                      backgroundColor: hoveredRow === project.id ? '#f9fafb' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredRow(project.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => goToProject(project.project_id)}
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
                        backgroundColor: project.status === 'inprogress' ? '#e6f7ff' :
                          project.status === 'planning' ? '#f3e8ff' :
                            project.status === 'done' ? '#dcfce7' :
                              project.status === 'review' ? '#fef9c3' : '#f3f4f6',
                        color: project.status === 'inprogress' ? '#0072e5' :
                          project.status === 'planning' ? '#9333ea' :
                            project.status === 'done' ? '#16a34a' :
                              project.status === 'review' ? '#ca8a04' : '#4b5563'
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
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'No due date'}
                    </td>
                    <td style={{
                      padding: '16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {Array.isArray(project.team) && project.team.length > 0 ? (
                          <>
                            {project.team.slice(0, 3).map((member, index) => (
                              <div
                                key={member.id}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#e5e7eb',  // You can also randomize this color based on the initials
                                  border: '2px solid white',
                                  overflow: 'hidden',
                                  position: 'relative',
                                  zIndex: project.team.length - index,
                                  marginLeft: index > 0 ? '-8px' : '0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  color: '#4b5563'
                                }}
                                title={member.name}
                              >
                                {member.initials || '?'}
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
                          </>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '14px' }}>No team members</span>
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
            {loading ? (
              <p>Loading projects...</p>
            ) : (
              <div>
                <p>No projects available</p>
                <button
                  onClick={goToProjectsPage}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        marginBottom: '24px'
      }}>
{/* My Tasks - Styled to match Recent Projects */}
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
    }}>My Tasks</h2>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); goToProjectsPage(); }}
      style={{
        color: '#3b82f6',
        fontSize: '14px',
        textDecoration: 'none',
        fontWeight: 500
      }}
    >
      View All
    </a>
  </div>
  
  {loadingTasks ? (
    <div style={{ 
      padding: '24px', 
      textAlign: 'center',
      color: '#6b7280' 
    }}>
      Loading your tasks...
    </div>
  ) : myTasks.length > 0 ? (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed' /* Added fixed layout */
      }}>
        <thead>
          <tr>
            <th style={{
              width: '25%', /* Added width */
              textAlign: 'left',
              padding: '12px 16px',
              fontWeight: 500,
              color: '#4b5563',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>Task Name</th>
            <th style={{
              width: '25%', /* Added width */
              textAlign: 'left',
              padding: '12px 16px',
              fontWeight: 500,
              color: '#4b5563',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>Project Name</th>
            <th style={{
              width: '15%', /* Added width */
              textAlign: 'center', /* Changed to center */
              padding: '12px 16px',
              fontWeight: 500,
              color: '#4b5563',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>Priority</th>
            <th style={{
              width: '15%', /* Added width */
              textAlign: 'center', /* Changed to center */
              padding: '12px 16px',
              fontWeight: 500,
              color: '#4b5563',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>Task Status</th>
            <th style={{
              width: '20%', /* Added width */
              textAlign: 'left',
              padding: '12px 16px',
              fontWeight: 500,
              color: '#4b5563',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {myTasks.map((task) => (
            <tr
                    key={task.id}
                    style={{
                      transition: 'background-color 0.2s',
                      backgroundColor: hoveredRow === task.id ? '#f9fafb' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredRow(task.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => goToTask(task.projectId)}
                  >
              <td style={{
                width: '25%', /* Added width */
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 500,
                color: task.status === 'completed' || task.status === 'done' ? '#9ca3af' : '#111827',
                textDecoration: task.status === 'completed' || task.status === 'done' ? 'line-through' : 'none'
              }}>
                {task.title}
              </td>
              <td style={{
                width: '25%', /* Added width */
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span role="img" aria-label="folder" style={{ fontSize: '14px' }}>📁</span>
                  {task.projectName}
                </div>
              </td>
              <td style={{
                width: '15%', /* Added width */
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: task.priority === 'High' || task.priority === 'high' ? '#fee2e2' :
                    task.priority === 'Medium' || task.priority === 'medium' ? '#fef9c3' :
                      task.priority === 'Low' || task.priority === 'low' ? '#dcfce7' : '#f3f4f6',
                  color: task.priority === 'High' || task.priority === 'high' ? '#dc2626' :
                    task.priority === 'Medium' || task.priority === 'medium' ? '#ca8a04' :
                      task.priority === 'Low' || task.priority === 'low' ? '#16a34a' : '#4b5563'
                }}>
                  {task.priority}
                </span>
              </td>
              <td style={{
                width: '15%', /* Added width */
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: 
                    task.status === 'To Do' || task.status === 'todo' ? '#f3f4f6' :
                    task.status === 'In Progress' || task.status === 'inprogress' ? '#fef9c3' :
                    task.status === 'Review' || task.status === 'review' ? '#e6f7ff' :
                    task.status === 'Done' || task.status === 'done' ? '#dcfce7' : 
                    '#f3f4f6',
                  color: 
                    task.status === 'To Do' || task.status === 'todo' ? '#6b7280' :
                    task.status === 'In Progress' || task.status === 'inprogress' ? '#ca8a04' :
                    task.status === 'Review' || task.status === 'review' ? '#0072e5' :
                    task.status === 'Done' || task.status === 'done' ? '#16a34a' : 
                    '#4b5563'
                }}>
                  {task.status}
                </span>
              </td>
              <td style={{
                width: '20%', /* Added width */
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {task.dueDate && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span role="img" aria-label="calendar" style={{ fontSize: '14px' }}>📅</span>
                    Due {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                )}
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
      <p>You don't have any assigned tasks</p>
      <button
        onClick={goToProjectsPage}
        style={{
          marginTop: '8px',
          padding: '8px 16px',
          backgroundColor: '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Browse Projects
      </button>
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default Dashboard;