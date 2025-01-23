import React from 'react';

const styles = {
    container: {
        width: '100%',
        height: '100vh',  // ปรับให้เต็มขนาดความสูงของหน้าจอ
        padding: '32px',
        background: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        overflowY: 'auto',  // ทำให้มีการเลื่อนเฉพาะแนวตั้ง
        overflowX: 'hidden',  // ซ่อนการเลื่อนแนวนอน
    },
    header: {
        alignSelf: 'stretch',
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '4px',
    },
    headerText: {
        fontSize: '16px',
        color: '#4B5563',
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
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableRow: {
        borderBottom: '1px solid #E5E7EB',
        height: '50px',
    },
    tableCell: {
        padding: '12px',
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
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Welcome back, Alex!</h1>
                <p style={styles.headerText}>Here's what's happening with your projects today.</p>
            </div>
            <div style={styles.cardContainer}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <span style={styles.cardText}>Total Projects</span>
                        <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '8px' }}>📁</div>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>24</h2>
                    <p style={{ color: '#10B981', fontSize: '14px' }}>⬆ 12% from last month</p>
                </div>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <span style={styles.cardText}>Active Tasks</span>
                        <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: '8px' }}>📝</div>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>147</h2>
                    <p style={{ color: '#10B981', fontSize: '14px' }}>⬆ 8% from last week</p>
                </div>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Recent Projects</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Due Date</th>
                            <th>Team</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={styles.tableRow}>
                            <td>Website Redesign</td>
                            <td><span style={{ background: '#D1FAE5', borderRadius: '16px', padding: '4px 12px', color: '#065F46' }}>In Progress</span></td>
                            <td>70%</td>
                            <td>Aug 25, 2025</td>
                            <td>👩‍💻👨‍💻</td>
                        </tr>
                        <tr style={styles.tableRow}>
                            <td>Mobile App</td>
                            <td><span style={{ background: '#FEF3C7', borderRadius: '16px', padding: '4px 12px', color: '#92400E' }}>On Hold</span></td>
                            <td>40%</td>
                            <td>Sep 15, 2025</td>
                            <td>👩‍💻👨‍💻</td>
                        </tr>
                    </tbody>
                </table>
            </div>
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