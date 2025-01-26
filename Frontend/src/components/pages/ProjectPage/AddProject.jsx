import { display, height, padding, textAlign, width } from "@mui/system";
import React, { useState } from "react";
import axios from "axios"; // Import Axios

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
    height: "431px",         // ความกว้างคงที่ตามดีไซน์
    maxWidth: "90vw",         // จำกัดความกว้างไม่ให้เกินขอบหน้าจอ
    maxHeight: "90vh",        // จำกัดความสูงเพื่อให้ไม่เกินขอบหน้าจอ
    overflow: "hidden",       // ป้องกันการเลื่อนออกขอบ
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    padding: "24px"
  },
  modalContent: {
    padding: "0 24px 0 24px",
    overflowY: "auto",       // เปิดให้เลื่อนเฉพาะแนวตั้ง
    overflowX: "hidden",     // ป้องกันการเลื่อนแนวนอน
    flexGrow: 1,
    scrollbarWidth: "none",
  },
  header: {
    fontFamily: "Inter, sans-serif",
    fontSize: "20px",
    fontWeight: "600",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    marginBottom: "12px",
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
    gap: "12px"
  },
  buttonCancel: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "16px",
    color: "#6B7280",
    cursor: "pointer",
  },
  buttonCreate: {
    backgroundColor: "#3B82F6",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  addMemberLink: {
    fontFamily: "Inter, sans-serif",
    color: "#3B82F6",
    fontSize: "14px",
    cursor: "pointer",
  },
  closeButton: {
    fontSize: "20px",
    cursor: "pointer",
    border: "none",
    background: "none",
    justifyContent: "flex"
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
    marginBottom: "8px", // เพิ่มระยะห่างระหว่าง label และ input
    display: "block",
  },
  inputField: {
    width: "400px",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "#F9FAFB",
    padding: "0 0 0 16px",
  },
  sectionSpacing: {
    marginBottom: "24px", // เพิ่มระยะห่างระหว่าง Project Name และ Team Members
  },
};


const CreateProjectModal = ({ onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ email: "", role: "" }]);
  const [isSaving, setIsSaving] = useState(false); // เพิ่มสถานะการโหลด

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: "", role: "" }]);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = [...teamMembers];
    updatedMembers.splice(index, 1);
    setTeamMembers(updatedMembers);
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Project name is required.");
      return;
    }

    try {
      setIsSaving(true); // เริ่มต้นโหลด
      const response = await axios.post("http://localhost:5000/api/projects", {
        title: projectName,
        tasksCompleted: 0,  // ค่าเริ่มต้น
        totalTasks: teamMembers.length, // ใช้จำนวนสมาชิกเป็นจำนวน task
        teamMembers: teamMembers, // ส่งรายชื่อสมาชิกไปยัง API
      });

      if (response.data.success) {
        alert("Project created successfully!");
        setProjectName(""); // รีเซ็ตฟอร์ม
        setTeamMembers([{ email: "", role: "" }]);
        onClose();
      } else {
        alert("Failed to create project. Try again.");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Error occurred while creating the project.");
    } finally {
      setIsSaving(false); // หยุดโหลด
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span>Create New Project</span>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div style={styles.modalContent}>
          <div style={styles.sectionSpacing}>
            <label style={styles.inputLabel}>Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={styles.inputField}
            />
          </div>
          <div>
            <label style={styles.inputLabel}>Team Members</label>
            {teamMembers.map((member, index) => (
              <div key={index} style={styles.row}>
                <input
                  type="email"
                  placeholder="Enter member email"
                  value={member.email}
                  onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                  style={styles.input}
                />
                <select
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button style={styles.removeButton} onClick={() => handleRemoveMember(index)}>
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div style={styles.addMemberLink} onClick={handleAddMember}>
            + Add Another Member
          </div>
        </div>
        <div style={styles.buttonContainer}>
          <button style={styles.buttonCancel} onClick={onClose}>
            Cancel
          </button>
          <button 
            style={styles.buttonCreate} 
            onClick={handleCreateProject} 
            disabled={isSaving} // ปิดปุ่มขณะกำลังบันทึก
          >
            {isSaving ? "Saving..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
