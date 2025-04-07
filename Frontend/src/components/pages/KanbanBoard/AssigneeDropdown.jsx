import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './KanbanBoard.css';

const AssigneeDropdown = ({ 
  projectId, 
  selectedAssignees, // Now expecting an array of emails
  onAssigneeChange, // Will receive an array of emails
  API_BASE_URL,
  disabled = false  // เพิ่ม prop disabled โดย default เป็น false
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  // Ensure selectedAssignees is always an array
  const assigneeList = Array.isArray(selectedAssignees) ? selectedAssignees : 
                      (selectedAssignees ? [selectedAssignees] : []);
  
  // Fetch project users with proper response format handling
  useEffect(() => {
    const fetchProjectUsers = async () => {
      if (!projectId) {
        setUsers([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const baseUrl = API_BASE_URL || 'http://localhost:8081';
        const response = await axios.get(`${baseUrl}/api/projects/${projectId}/users`);
        
        // Handle the nested response format
        if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
          console.log('Project users fetched successfully:', response.data.data);
          const formattedUsers = response.data.data.map(user => ({
            id: user.user_id,
            email: user.email,
            role: user.role,
            // Extract name from email (e.g., john.doe@example.com -> John Doe)
            displayName: formatNameFromEmail(user.email)
          }));
          setUsers(formattedUsers);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Failed to load users: Invalid response format');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching project users:', error);
        setError('Failed to load users: ' + (error.message || 'Unknown error'));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectUsers();
  }, [projectId, API_BASE_URL]);
  
  // Format a display name from an email
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
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Generate initials from email
  const getInitials = (email) => {
    if (!email) return 'NA';
    
    // If it's an email, use the first part before @ symbol
    const emailName = email.split('@')[0];
    // Take first chars of words if it has dots
    if (emailName.includes('.')) {
      return emailName.split('.')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else {
      // Otherwise take first two chars
      return emailName.substring(0, 2).toUpperCase();
    }
  };
  
  // Handle selecting/deselecting a user
  const handleSelectUser = (user) => {
    if (!onAssigneeChange) return;
    
    const email = user.email || '';
    
    if (email === '') {
      // If "Unassigned" is selected, clear all assignees
      onAssigneeChange([]);
    } else {
      // Check if this user is already selected
      const isAlreadySelected = assigneeList.includes(email);
      
      if (isAlreadySelected) {
        // Remove this user from selection
        onAssigneeChange(assigneeList.filter(e => e !== email));
      } else {
        // Add this user to selection
        onAssigneeChange([...assigneeList, email]);
      }
    }
    
    // Keep dropdown open for multiple selections
    if (email !== '') {
      // Set focus back to search input
      const searchInput = dropdownRef.current?.querySelector('input[type="text"]');
      if (searchInput) {
        searchInput.focus();
      }
    } else {
      // Close dropdown if "Unassigned" was selected
      setDropdownOpen(false);
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTermLower))
    );
  });
  
  // Find the selected users
  const selectedUserObjects = users.filter(user => assigneeList.includes(user.email));
  
  // Format email for display (show only the first part)
  const formatEmailForDisplay = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    return parts[0];
  };
  
  return (
    <div className="assignee-dropdown" ref={dropdownRef}>
      <div 
        className="assignee-display" 
        onClick={() => {
          if (!disabled) {
            setDropdownOpen(!dropdownOpen);
          }
        }}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {selectedUserObjects.length === 0 ? (
          // Show "Unassigned" if no one is assigned
          <div className="unassigned-display">
            <div className="unassigned-avatar">
              NA
            </div>
            <div className="assignee-name">Unassigned</div>
          </div>
        ) : (
          // Show all assigned users
          <div className="selected-assignees-container">
            {selectedUserObjects.map(user => (
              <div 
                key={`selected-${user.id || user.email}`}
                className="selected-assignee"
              >
                <div className="selected-avatar">
                  {getInitials(user.email)}
                </div>
                <span className="selected-email">
                  {formatEmailForDisplay(user.email)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="dropdown-arrow">
          ▼
        </div>
      </div>
      
      {dropdownOpen && !disabled && (
        <div className="assignee-dropdown-menu">
          <div className="search-container-dropdown">
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-dropdown"
            />
          </div>
          
          {loading ? (
            <div className="dropdown-message">
              Loading users...
            </div>
          ) : error ? (
            <div className="dropdown-error">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="dropdown-message">
              {searchTerm ? 'No users found matching search' : 'No users available'}
            </div>
          ) : (
            <div>
              <div 
                className={`dropdown-item ${assigneeList.length === 0 ? 'selected' : ''}`}
                onClick={() => handleSelectUser({ email: '' })}
              >
                <input 
                  type="checkbox" 
                  checked={assigneeList.length === 0}
                  readOnly
                />
                <div className="unassigned-avatar-dropdown">
                  NA
                </div>
                <div>Unassigned</div>
              </div>
              
              {filteredUsers.map(user => (
                <div 
                  key={user.id || `user-${user.email}`}
                  className={`dropdown-item ${assigneeList.includes(user.email) ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <input 
                    type="checkbox" 
                    checked={assigneeList.includes(user.email)}
                    readOnly
                  />
                  <div className={`assignee-avatar-dropdown ${assigneeList.includes(user.email) ? 'selected' : ''}`}>
                    {getInitials(user.email)}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">{formatEmailForDisplay(user.email)}</div>
                    {user.role && <div className="dropdown-user-role">{user.role}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssigneeDropdown;
