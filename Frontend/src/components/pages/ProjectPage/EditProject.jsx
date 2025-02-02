import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
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
    height: "auto",
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
    overflowY: "auto",
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
    width: "390px",
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
    marginBottom: "8px",
    display: "block",
  },
};

const EditProjectModal = ({ projectId, onClose, onProjectUpdated }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ email: "", role: "" }]);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ โหลดข้อมูล Project + Team Members
  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log("Fetching project data for ID:", projectId);
        const response = await axios.get(`${url}/api/projects/${projectId}`);
        const data = response.data.data;

        console.log("Fetched Project Data:", data);

        setProjectName(data.title || ""); 
        setProjectDescription(data.description || ""); 
        setTeamMembers(data.teamMembers || [{ email: "", role: "" }]); 
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // ✅ เพิ่มสมาชิกทีมใหม่
  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: "", role: "" }]);
  };

  // ✅ ลบสมาชิกทีม
  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  // ✅ อัปเดตค่าของสมาชิกทีม
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  // ✅ บันทึกการเปลี่ยนแปลง
  const handleSaveChanges = async () => {
    if (!projectName.trim()) {
      alert("Project name is required.");
      return;
    }
  
    if (teamMembers.length === 0) {
      alert("At least one team member is required.");
      return;
    }
  
    try {
      setIsSaving(true);
      console.log("🔄 Sending update request...");
  
      // เช็คว่าทีมเมมเบอร์ถูกต้อง
      console.log("👥 Team Members Data:", teamMembers);
  
      const response = await axios.put(`${url}/api/projects/${projectId}`, {
        title: projectName,
        description: projectDescription,
        teamMembers: teamMembers,
      });
  
      console.log("✅ Update Response:", response.data);
  
      if (response.data.success) {
        console.log("🎉 Project updated successfully!");
        await onProjectUpdated(); // โหลดข้อมูลใหม่
        onClose(); // ปิด Modal
      } else {
        console.error("❌ Failed to update project:", response.data);
        alert("Failed to update project. Try again.");
      }
    } catch (error) {
      console.error("🚨 Error updating project:", error.response?.data || error.message);
      alert("Error occurred while updating the project.");
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span>Edit Project</span>
          <button style={styles.removeButton} onClick={onClose}>
            <img src={crossIcon} alt="Close" />
          </button>
        </div>

        <div style={styles.modalContent}>
          <div>
            <label style={styles.inputLabel}>Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.inputLabel}>Project Description</label>
            <TextAreaField
              placeholder="Enter project description..."
              rows={5}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              inputStyles={{
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
              }}
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
                  <img src={deleteIcon} alt="Remove" />
                </button>
              </div>
            ))}
          </div>

          <div style={styles.addMemberLink} onClick={handleAddMember}>
            + Add Another Member
          </div>
        </div>
        <div style={styles.buttonContainer}>
          <Button
            sx={{
              fontFamily: "Inter, sans-serif",
              backgroundColor: "#4F46E5",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                fontSize: "12px",
                borderRadius: "8px",
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
            backgroundColor: "#4F46E5",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              fontSize: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              }}
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;

