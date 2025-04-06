import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AssigneeDropdown = ({ 
  projectId, 
  selectedAssignees, // Now expecting an array of emails
  onAssigneeChange, // Will receive an array of emails
  API_BASE_URL 
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
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          border: '2px solid #DFE1E6',
          borderRadius: '3px',
          backgroundColor: '#FAFBFC',
          cursor: 'pointer',
          minHeight: '36px'
        }}
      >
        {selectedUserObjects.length === 0 ? (
          // Show "Unassigned" if no one is assigned
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              backgroundColor: '#DFE1E6',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#172B4D'
            }}>
              NA
            </div>
            <div style={{ fontSize: '14px' }}>Unassigned</div>
          </div>
        ) : (
          // Show all assigned users
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px',
            maxWidth: '100%'
          }}>
            {selectedUserObjects.map(user => (
              <div 
                key={`selected-${user.id || user.email}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#E9F2FF',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  maxWidth: '100%'
                }}
              >
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  backgroundColor: '#4C9AFF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {getInitials(user.email)}
                </div>
                <span style={{ 
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '80px'  // Adjust based on your layout
                }}>
                  {formatEmailForDisplay(user.email)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginLeft: 'auto' }}>
          ▼
        </div>
      </div>
      
      {dropdownOpen && (
        <div className="assignee-dropdown-menu" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid #DFE1E6',
          borderRadius: '3px',
          boxShadow: '0 4px 8px rgba(9, 30, 66, 0.25)',
          zIndex: 10,
          marginTop: '4px',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '8px' }}>
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #DFE1E6',
                borderRadius: '3px',
                fontSize: '14px'
              }}
            />
          </div>
          
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6B778C' }}>
              Loading users...
            </div>
          ) : error ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#DE350B' }}>
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6B778C' }}>
              {searchTerm ? 'No users found matching search' : 'No users available'}
            </div>
          ) : (
            <div>
              <div 
                className="dropdown-item" 
                onClick={() => handleSelectUser({ email: '' })}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F4F5F7',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: assigneeList.length === 0 ? 'rgba(9, 30, 66, 0.04)' : 'transparent'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={assigneeList.length === 0}
                  readOnly
                  style={{ marginRight: '8px' }}
                />
                <div style={{
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#DFE1E6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#172B4D'
                }}>
                  NA
                </div>
                <div>Unassigned</div>
              </div>
              
              {filteredUsers.map(user => (
                <div 
                  key={user.id || `user-${user.email}`}
                  className="dropdown-item"
                  onClick={() => handleSelectUser(user)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F4F5F7',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: assigneeList.includes(user.email) ? 'rgba(9, 30, 66, 0.04)' : 'transparent'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={assigneeList.includes(user.email)}
                    readOnly
                    style={{ marginRight: '8px' }}
                  />
                  <div style={{
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: assigneeList.includes(user.email) ? '#4C9AFF' : '#DFE1E6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: assigneeList.includes(user.email) ? 'white' : '#172B4D'
                  }}>
                    {getInitials(user.email)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '14px' }}>{formatEmailForDisplay(user.email)}</div>
                    {user.role && <div style={{ fontSize: '12px', color: '#6B778C' }}>{user.role}</div>}
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