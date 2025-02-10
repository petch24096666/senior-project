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
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
    },
    card: {
        width: '280px',
        padding: '24px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
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
        fontFamily: "Inter, sans-serif", // ✅ ใช้ฟอนต์ Inter Sans
    },
    tableHeaderRow: {
        backgroundColor: "#F3F4F6", // ✅ ทำให้หัวตารางดูเด่น
    },
    tableHeader: {
        textAlign: "left",
        fontWeight: "700",
        padding: "12px",
        fontFamily: "Inter, sans-serif", // ✅ ฟอนต์ Inter Sans
    },
    tableRow: {
        borderBottom: "1px solid #E5E7EB",
        height: "50px",
    },
    tableCell: {
        textAlign: "left",
        padding: "12px",
        fontFamily: "Inter, sans-serif", // ✅ ฟอนต์ Inter Sans
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
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    }
};

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${url}/api/projects`);
            const projectData = response.data.data || [];

            setProjects(projectData);

            // ✅ คำนวณจำนวน Tasks ทั้งหมด (ถ้า totalTasks เป็น null หรือ undefined ให้เป็น 0)
            const taskCount = projectData.reduce((acc, project) => acc + (project.totalTasks || 0), 0);
            setTotalTasks(taskCount || 0);

        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Welcome back!</h1>
                <p style={styles.headerText}>Here's what's happening with your projects today.</p>
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
            {/* 📌 เหี้ยไรไม่รู้ */}
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
