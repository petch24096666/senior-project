import React, { useState } from "react";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const styles = {
    cardContainer: {
        width: "262px",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "25px",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
    },
    cardHeader: {
        fontFamily: "Inter, sans-serif",
        fontSize: "24px",
        fontWeight: "600",
        lineHeight: "29.05px",
        color: "#111827",
    },
    taskRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "10px",
    },
    taskLabel: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontWeight: "400",
        lineHeight: "16px",
        color: "#6B7280",
    },
    taskIcon: {
        fontSize: "16px",
        color: "#6366F1",
    },
    cardTaskNumber: {
        fontFamily: "Inter, sans-serif",
        fontSize: "24px",
        fontWeight: "600",
        lineHeight: "29.05px",
        color: "#111827",
        marginTop: "8px",
    },
    progressBarContainer: {
        width: "100%",
        height: "6px",
        backgroundColor: "#E5E7EB",
        borderRadius: "3px",
        overflow: "hidden",
        marginTop: "10px",
    },
    progressBar: (progress) => ({
        width: `${progress}%`,
        height: "100%",
        backgroundColor: "#6366F1",
    }),
    cardDescription: {
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: "400",
        lineHeight: "20px",
        color: "#6B7280",
        marginTop: "10px",
        marginBottom: "10px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 3, // แสดงสูงสุด 3 บรรทัด
        WebkitBoxOrient: "vertical",
    },
};

const ProjectCard = ({ title, description, tasksCompleted, totalTasks, onEdit, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    const progress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

    return (
        <div style={styles.cardContainer}>
            {/* ส่วนหัวของการ์ด (Header + ปุ่มไข่ปลา) */}
            <div style={styles.headerRow}>
                <h3 style={styles.cardHeader}>{title || "Untitled Project"}</h3>
                <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                </IconButton>
            </div>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        onEdit && onEdit();
                    }}
                >
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        onDelete && onDelete();
                    }}
                >
                    Delete
                </MenuItem>
            </Menu>

            <p style={styles.cardDescription}>
                {description || "No description available"}
            </p>

            <div style={styles.taskRow}>
                <span style={styles.taskLabel}>Tasks</span>
                <span style={styles.taskIcon}>
                    <PlaylistAddCheckIcon />
                </span>
            </div>

            <div>
                <span style={styles.cardTaskNumber}>
                    {`${tasksCompleted || 0}/${totalTasks || 0}`}
                </span>
            </div>

            <div style={styles.progressBarContainer}>
                <div style={styles.progressBar(progress)}></div>
            </div>
        </div>
    );
};

export default ProjectCard;
