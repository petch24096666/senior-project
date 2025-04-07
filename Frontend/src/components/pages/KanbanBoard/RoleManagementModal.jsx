import React, { useState, useEffect } from 'react';
import './KanbanBoard.css';
import axios from 'axios';
import { useRBAC } from '../../../context/RBAC';
import { Snackbar, Alert } from '@mui/material';

const RoleManagementModal = ({ open, onClose, projectId, API_BASE_URL }) => {
  const { fetchProjectRole } = useRBAC(); // นำเข้าฟังก์ชันจาก RBAC context
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });
    
  useEffect(() => {
    const fetchProjectUsers = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const baseUrl = API_BASE_URL || 'http://localhost:8081';
        const response = await axios.get(`${baseUrl}/api/projects/${projectId}/users`);
        
        if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
          // Get the project creator information
          let projectInfo;
          try {
            const projectResponse = await axios.get(`${baseUrl}/api/projects/${projectId}`);
            projectInfo = projectResponse.data.data;
          } catch (projErr) {
            console.error('Error fetching project details:', projErr);
          }
          
          const formattedUsers = response.data.data.map(user => ({
            id: user.user_id,
            email: user.email,
            role: user.role || 'view-only', // Default to view-only if no role
            name: formatNameFromEmail(user.email),
            // Mark if this user is the creator of the project
            isCreator: projectInfo && projectInfo.created_by === user.user_id
          }));
          setUsers(formattedUsers);
        } else {
          setError('Failed to load users: Invalid response format');
        }
      } catch (error) {
        setError('Failed to load users: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchProjectUsers();
    }
  }, [projectId, API_BASE_URL, open]);
  
  const formatNameFromEmail = (email) => {
    if (!email) return '';
    
    // Extract the part before @
    const namePart = email.split('@')[0];
    
    // Replace dots with spaces and capitalize each word
    return namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const showNotification = (message, type = "info") => {
    setNotification({ open: true, message, type });
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      
      // หากผู้ใช้ที่ต้องการเปลี่ยน role มี role เป็น "admin" และพยายามเปลี่ยนไปเป็น role อื่น
      if (userToUpdate.role.toLowerCase() === 'admin' && newRole.toLowerCase() !== 'admin') {
        // นับจำนวน admin ในระบบ
        const adminCount = users.filter(u => u.role.toLowerCase() === 'admin').length;
        if (adminCount <= 1) {
          showNotification("There must be at least one admin in the project.", "error");
          return;
        }
      }
      
      // ห้ามเปลี่ยน role ของ creator
      if (userToUpdate && userToUpdate.role.toLowerCase() === 'creator') {
        showNotification('Cannot change the role of the project creator', "error");
        return;
      }
      
      const baseUrl = API_BASE_URL || 'http://localhost:8081';
      await axios.put(`${baseUrl}/api/projects/${projectId}/users/${userId}/role`, {
        role: newRole
      });
      
      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
  
      // Refresh RBAC context สำหรับโปรเจคนี้
      await fetchProjectRole(projectId);
    } catch (error) {
      showNotification('Failed to update role: ' + (error.message || 'Unknown error'), "error");
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleClass = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'admin-role';
      case 'edit': return 'editor-role';
      case 'view-only': return 'viewer-role';
      default: return '';
    }
  };

  const filteredUsers = searchTerm.trim() === '' 
    ? users 
    : users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="role-management-modal">
        <div className="modal-header">
          <h2>Role Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {successMessage && <div className="modal-success">{successMessage}</div>}
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="modal-loading">Loading users...</div>
          ) : error ? (
            <div className="modal-error">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="modal-empty">No users found</div>
          ) : (
            <table className="role-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {getInitials(user.name)}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`role-badge ${getRoleClass(user.role)}`}>
                        {user.role}
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                        disabled={user.role.toLowerCase() === 'admin' && user.isCreator}
                      >
                        <option value="admin">Admin</option>
                        <option value="edit">Edit</option>
                        <option value="view-only">View-only</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.type} 
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RoleManagementModal;
