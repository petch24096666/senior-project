import React, { useState } from "react";
import { Button } from "@mui/material"; // Import Button จาก MUI
import { TextAreaField } from "@aws-amplify/ui-react";
import axios from "axios";
import deleteIcon from "../../../assets/icons/Trash-icon.png";
import crossIcon from "../../../assets/icons/cross-icon.png";

const url = import.meta.env.VITE_BACKEND_URL;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "500px",
    height: "700px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
  },
  modalContent: {
    padding: "0 24px",
    flexGrow: 1,
    scrollbarWidth: "none",
  },
  header: {
    fontFamily: "Inter, sans-serif",
    fontSize: "20px",
    fontWeight: "600",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    backgroundColor: "#F9FAFB",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  },
  addMemberLink: {
    fontFamily: "Inter, sans-serif",
    color: "#3B82F6",
    fontSize: "14px",
    cursor: "pointer",
  },
  removeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#EF4444",
    fontSize: "18px",
    cursor: "pointer",
  },
  inputLabel: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginBottom: "10px",
  },
  inputTaskName: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginBottom: "10px",
  },
  inputDescription: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginTop: "15px",
    marginBottom: "10px",
  },
  inputDueDate: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginTop: "15px",
    marginBottom: "10px",
  },
  inputAssign: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginTop: "15px",
    marginBottom: "10px",
  },
  inputGroup: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    display: "block",
    marginTop: "15px",
    marginBottom: "10px",
  },
  inputFieldTaskName: {
    width: "400px",
    height: "42px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "#F9FAFB",
    padding: "0 0 0 16px",
  },
  inputFieldDescription: {
    width: "385px",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    backgroundColor: "#F9FAFB",
    color: "#374151",
    fontFamily: "Inter, sans-serif",
    resize: "none",
    outline: "none",
  },
  inputFieldDueDate: {
    width: "400px",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "#F9FAFB",
    padding: "0 0 0 16px",
    fontSize: "14px",
  },
  inputFieldGroup: {
    width: "418px",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "#F9FAFB",
    padding: "0 0 0 16px",
    fontSize: "14px",
  },
  labelContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  label: {
    padding: "6px 12px",
    fontSize: "12px",
    borderRadius: "16px",
    border: "2px solid white", // เส้นขอบสีขาว
    cursor: "pointer",
    transition: "0.3s",
  },
  createLabelButton: {
    backgroundColor: "#E5E7EB",
    color: "#374151",
    border: "none",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "500",
    borderRadius: "16px",
    cursor: "pointer",
  },

  assignMembersLabel: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    display: "block",
  },
  membersList: {
    display: "flex",
    alignItems: "center",
  },
  memberAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  addMemberButton: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px dashed #6B7280",
    backgroundColor: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const labelColors = {
  QA: "#BFDBFE",
  Dev: "#D1FAE5",
  Design: "#E9D5FF",
  Research: "#FDE68A",
};  

const AddTasktModal = ({ onClose, onTaskCreated }) => {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskGroup, setTaskGroup] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateTask = async () => {
    if (!taskName.trim() || selectedLabels.length === 0 || !taskDueDate.trim() || !taskGroup.trim()) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        setIsSaving(true);

        const newTask = {
            task_label: selectedLabels.join(","), // ส่ง labels เป็น string คั่นด้วย ,
            task_name: taskName,
            task_description: taskDescription,
            task_due_date: taskDueDate,
            task_group: taskGroup
        };

        const response = await axios.post(`${url}/api/task`, newTask);

        if (response.data.success) {
            alert("Task created successfully!");

            // รีเซ็ตค่าอินพุต
            setTaskName("");
            setTaskDescription("");
            setTaskDueDate("");
            setTaskGroup("");
            setSelectedLabels([]);

            // ส่งข้อมูล Task ใหม่ไปให้ Kanban Board อัปเดต
            onTaskCreated({ ...newTask, id: response.data.taskId });

            // ปิด Modal
            onClose();
        } else {
            alert("Failed to create task. Try again.");
        }
    } finally {
        setIsSaving(false);
    }
  };  

  const handleLabelChange = (label) => {
    setSelectedLabels([label]); // เซ็ตค่าใหม่ให้มีแค่ Label ที่เลือก
  };

  const getLabelStyle = (label) => ({ 
    ...styles.label,
    backgroundColor: selectedLabels.includes(label)
      ? darkenColor(labelColors[label]) // ถ้าเลือกแล้วให้ใช้สีเข้มขึ้น
      : labelColors[label], // ถ้ายังไม่เลือกให้ใช้สีหลัก
    fontWeight: selectedLabels.includes(label) ? "bold" : "normal", // ทำให้ตัวหนาถ้าเลือก
    color: selectedLabels.includes(label) ? "#111827" : "#374151", // เปลี่ยนสีข้อความให้เข้มขึ้นเมื่อเลือก
    border: "2px solid white", // เส้นขอบสีขาว
    boxShadow: selectedLabels.includes(label)
      ? "0px 0px 8px rgba(0, 0, 0, 0.3)" // เพิ่มเงาเมื่อเลือก
      : "none",
    transform: selectedLabels.includes(label) ? "scale(1.05)" : "scale(1)", // ขยายขนาดเล็กน้อยเมื่อถูกเลือก
  });
  
  const darkenColor = (color, percent = 1) => {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
    const B = Math.max((num & 0x0000ff) - amt, 0);
    return `rgb(${R}, ${G}, ${B})`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span>Create New Task</span>
          <button style={styles.removeButton} onClick={onClose}>
            <img src={crossIcon} alt="Remove"/>
          </button>
        </div>

        <div style={styles.modalContent}>
          <label style={styles.inputLabel}>Labels</label>
          <div style={styles.labelContainer}>
            {["QA", "Dev", "Design", "Research"].map((label, index) => (
              <button 
                key={index}
                onClick={() => handleLabelChange(label)}
                style={getLabelStyle(label)}>
                {label}
              </button>
            ))}
            <button style={styles.createLabelButton}>+ Create Label</button>
          </div>
        </div>
        <div style={styles.modalContent}>
          <label style={styles.inputTaskName}>Task Name</label>
          <input
            type="text"
            placeholder="Enter task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={styles.inputFieldTaskName}
          />
          <label style={styles.inputDescription}>Description</label>
          <TextAreaField
            placeholder="Enter task description..."
            rows={5}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            style={styles.inputFieldDescription}
          />
          <label style={styles.inputDueDate}>Due Date</label>
          <input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            style={styles.inputFieldDueDate}
          />
          <label style={styles.inputAssign}>Assign Members</label>
          <label style={styles.inputGroup}>Group</label>
          <select 
            value={taskGroup}
            onChange={(e) => setTaskGroup(e.target.value)}
            style={styles.inputFieldGroup}
          >
            <option value="">Select group</option>
            <option value="Group 1">One</option>
            <option value="Group 2">Two</option>
            <option value="Group 3">Three</option>
          </select>
        </div>
        <div style={styles.buttonContainer}>
          <Button
            sx={{
              fontFamily: "Inter, sans-serif",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "12px",
              color: "#6B7280",
              cursor: "pointer",
            }}
            variant="outlined"
            color="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            sx={{
            fontFamily: "Inter, sans-serif",
              backgroundColor: "#3B82F6",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              fontSize: "12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            variant="contained"
            color="primary"
            onClick={handleCreateTask}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Create Task"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTasktModal;
