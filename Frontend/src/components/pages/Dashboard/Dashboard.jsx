import React, { useEffect, useState } from "react";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL;

const styles = {
    container: {
        width: '100%',
        height: '100vh',
        padding: '32px',
        background: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        overflowY: 'auto',
        overflowX: 'hidden',
        zoom: "0.85"
    },
    header: {
        alignSelf: 'stretch',
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '4px',
        fontFamily: "Inter, sans-serif"
    },
    headerText: {
        fontSize: '16px',
        color: '#4B5563',
        fontFamily: "Inter, sans-serif"
    },
    cardContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
    },
    card: {
        padding: '24px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        color: '#6B7280',
        fontSize: '16px',
        fontFamily: "Inter, sans-serif"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Inter, sans-serif",
    },
    tableHeaderRow: {
        backgroundColor: "#F3F4F6",
    },
    tableHeader: {
        textAlign: "left",
        fontWeight: "700",
        padding: "12px",
        fontFamily: "Inter, sans-serif",
    },
    tableRow: {
        borderBottom: "1px solid #E5E7EB",
        height: "50px",
    },
    tableCell: {
        textAlign: "left",
        padding: "12px",
        fontFamily: "Inter, sans-serif",
    },
    section: {
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
    },
    activityCard: {
        flex: 1,
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    calendarContainer: {
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        background: 'white',
        textAlign: 'center',
    },
    calendarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    calendarButton: {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        background: '#F9FAFB',
        border: 'none',
        color: '#6B7280',
        cursor: 'pointer',
    },
    calendarTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827',
        fontFamily: "Inter, sans-serif"
    },
    calendarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '4px',
    },
    dayName: {
        textAlign: 'center',
        padding: '2px 0',
        fontSize: '10px',
        fontWeight: '500',
        color: '#6B7280',
        fontFamily: "Inter, sans-serif"
    },
    emptyDay: {
        height: '28px',
    },
    day: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '28px',
        fontSize: '10px',
        cursor: 'pointer',
        borderRadius: '8px',
        color: '#6B7280',
        fontFamily: "Inter, sans-serif"
    },
    todayDay: {
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        fontWeight: '600',
    },
    selectedDay: {
        backgroundColor: '#4F46E5',
        color: 'white',
        fontWeight: '600',
    }
};

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Get current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Navigate to previous month
    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    // Navigate to next month
    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    // Format the month name
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Day names - short version to save space
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get day of week the month starts on (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const today = new Date();
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${url}/api/projects`);
            const projectData = response.data.data || [];

            setProjects(projectData);

            // Calculate total tasks
            const taskCount = projectData.reduce((acc, project) => acc + (project.totalTasks || 0), 0);
            setTotalTasks(taskCount || 0);

        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    // Render day cells for the calendar
    const renderCalendarDays = () => {
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < getFirstDayOfMonth(currentYear, currentMonth); i++) {
            days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>);
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= getDaysInMonth(currentYear, currentMonth); day++) {
            const isToday = day === today.getDate() && 
                            currentMonth === today.getMonth() && 
                            currentYear === today.getFullYear();
            
            const isSelected = selectedDate && 
                              day === selectedDate.getDate() && 
                              currentMonth === selectedDate.getMonth() && 
                              currentYear === selectedDate.getFullYear();
            
            const dayStyle = {
                ...styles.day,
                ...(isToday ? styles.todayDay : {}),
                ...(isSelected ? styles.selectedDay : {})
            };
            
            days.push(
                <div 
                    key={day} 
                    onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                    style={dayStyle}
                >
                    {day}
                </div>
            );
        }
        
        return days;
    };

    return (
        <div style={styles.container}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%'
            }}>
                <div style={styles.header}>
                    <h1 style={styles.headerTitle}>Welcome back!</h1>
                    <p style={styles.headerText}>Here's what's happening with your projects today.</p>
                </div>
            </div>

            {/* 📌 Overview Cards */}
            <div style={styles.cardContainer}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <span style={styles.cardText}>Total Projects</span>
                        <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '8px' }}>📁</div>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{projects.length}</h2>
                    <p style={{ color: '#10B981', fontSize: '14px' }}>⬆ 12% from last month</p>
                </div>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <span style={styles.cardText}>Active Tasks</span>
                        <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: '8px' }}>📝</div>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{totalTasks}</h2>
                    <p style={{ color: '#10B981', fontSize: '14px' }}>⬆ 8% from last week</p>
                </div>
                {/* Mini Calendar */}
                <div style={styles.calendarContainer}>
                    <div style={styles.calendarHeader}>
                        <button onClick={prevMonth} style={styles.calendarButton}>←</button>
                        <div style={styles.calendarTitle}>
                            {monthNames[currentMonth].substring(0, 3)} {currentYear}
                        </div>
                        <button onClick={nextMonth} style={styles.calendarButton}>→</button>
                    </div>
                    
                    <div style={styles.calendarGrid}>
                        {dayNames.map(day => (
                            <div key={day} style={styles.dayName}>{day}</div>
                        ))}
                        {renderCalendarDays()}
                    </div>
                </div>
            </div> 

            {/* 📌 Recent Projects Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                fontFamily: "Inter, sans-serif"
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px',
                    fontFamily: "Inter, sans-serif"
                }}>
                    Recent Projects
                </h3>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeaderRow}>
                            <th style={styles.tableHeader}>Project Name</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Progress</th>
                            <th style={styles.tableHeader}>Due Date</th>
                            <th style={styles.tableHeader}>Team</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? (
                            projects.slice(0, 5).map((project, index) => (
                                <tr key={index} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{project.title}</td>
                                    <td style={styles.tableCell}>
                                        <span style={{
                                            background: project.status === "Completed" ? '#D1FAE5' : '#FEF3C7',
                                            borderRadius: '16px',
                                            padding: '4px 12px',
                                            color: project.status === "Completed" ? '#065F46' : '#92400E',
                                            fontFamily: "Inter, sans-serif",
                                            fontWeight: "600"
                                        }}>
                                            {project.status || "In Progress"}
                                        </span>
                                    </td>
                                    <td style={styles.tableCell}>{`${project.tasksCompleted || 0}/${project.totalTasks || 0}`}</td>
                                    <td style={styles.tableCell}>{project.dueDate || "N/A"}</td>
                                    <td style={styles.tableCell}>👩‍💻👨‍💻</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", fontFamily: "Inter, sans-serif" }}>
                                    No projects available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 📌 Activity Section */}
            <div style={styles.section}>
                <div style={styles.activityCard}>
                    <h3>Recent Activity</h3>
                    <p>Sarah Miller completed the task "Update homepage hero section" 2 hours ago</p>
                    <p>John Cooper added a comment on "Mobile App Design" 4 hours ago</p>
                </div>
                <div style={styles.activityCard}>
                    <h3>Upcoming Tasks</h3>
                    <p>☐ Review design system documentation <span style={{ background: '#FEE2E2', borderRadius: '4px', padding: '4px 8px', color: '#B91C1C' }}>High</span></p>
                    <p>☐ Team meeting - Sprint planning <span style={{ background: '#FEF9C3', borderRadius: '4px', padding: '4px 8px', color: '#B45309' }}>Medium</span></p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;