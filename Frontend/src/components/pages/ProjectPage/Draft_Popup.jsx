import React, { useState } from "react";

const CreateProjectModal = () => {
  const [teamMembers, setTeamMembers] = useState([{ email: "", role: "" }]);

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: "", role: "" }]);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updatedMembers);
  };

  const handleChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create New Project</h2>
          <span style={styles.closeBtn}>&times;</span>
        </div>
        <div style={styles.modalBody}>
          <label style={styles.label}>Project Name</label>
          <input type="text" style={styles.input} placeholder="Enter project name" />

          <label style={styles.label}>Team Members</label>
          {teamMembers.map((member, index) => (
            <div style={styles.memberRow} key={index}>
              <input
                type="email"
                style={styles.input}
                placeholder="Enter member email"
                value={member.email}
                onChange={(e) => handleChange(index, "email", e.target.value)}
              />
              <select
                style={styles.select}
                value={member.role}
                onChange={(e) => handleChange(index, "role", e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Manager">Manager</option>
              </select>
              <button style={styles.deleteBtn} onClick={() => handleRemoveMember(index)}>
                🗑️
              </button>
            </div>
          ))}

          <button style={styles.addBtn} onClick={handleAddMember}>
            + Add Another Member
          </button>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn}>Cancel</button>
          <button style={styles.createBtn}>Create Project</button>
        </div>
      </div>
    </div>
  );
};

// CSS in JS
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "white",
    width: "450px",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "16px",
  },
  closeBtn: {
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
  },
  modalBody: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#4B5563",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "12px",
  },
  select: {
    padding: "10px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    marginLeft: "8px",
  },
  memberRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#9CA3AF",
  },
  addBtn: {
    color: "#2563EB",
    fontSize: "14px",
    cursor: "pointer",
    border: "none",
    background: "none",
    marginTop: "12px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: "#6B7280",
    fontSize: "14px",
    cursor: "pointer",
  },
  createBtn: {
    background: "#2563EB",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default CreateProjectModal;
