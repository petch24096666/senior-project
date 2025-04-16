import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TeamMemberDropdown = ({ 
  selectedTeamMembers, // คาดหวังรับ array ของอีเมลสมาชิกทีม
  onTeamMemberChange,  // ฟังก์ชัน callback จะได้รับ array ของอีเมลสมาชิกทีม
  API_BASE_URL,
  disabled = false
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Ensure selectedTeamMembers is always an array
  const teamList = Array.isArray(selectedTeamMembers) 
                      ? selectedTeamMembers 
                      : (selectedTeamMembers ? [selectedTeamMembers] : []);
  
  // Fetch all users from the system (for team selection)
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/api/allusers`);
        if (response.data && Array.isArray(response.data)) {
          // สมมติ user object มี property เช่น user_id, email, fullname
          const formattedUsers = response.data.map(user => ({
            id: user.user_id,
            email: user.email,
            displayName: user.fullname || formatNameFromEmail(user.email)
          }));
          setUsers(formattedUsers);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Failed to load users: Invalid response format');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users: ' + (error.message || 'Unknown error'));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, [API_BASE_URL]);
  
  // Format display name from email ถ้าไม่มี fullname
  const formatNameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };
  
  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // สร้าง initials จากอีเมล
  const getInitials = (email) => {
    if (!email) return 'NA';
    const emailName = email.split('@')[0];
    if (emailName.includes('.')) {
      return emailName.split('.')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else {
      return emailName.substring(0, 2).toUpperCase();
    }
  };
  
  // Handle เลือก/ยกเลิกเลือก user
  const handleSelectUser = (user) => {
    if (!onTeamMemberChange) return;
    const email = user.email || '';
    const isAlreadySelected = teamList.includes(email);
    if (isAlreadySelected) {
      onTeamMemberChange(teamList.filter(e => e !== email));
    } else {
      onTeamMemberChange([...teamList, email]);
    }
    const searchInput = dropdownRef.current?.querySelector('input[type="text"]');
    if (searchInput) searchInput.focus();
  };
  
  // กรองรายชื่อผู้ใช้จาก searchTerm
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.displayName && user.displayName.toLowerCase().includes(term))
    );
  });
  
  // หาผู้ใช้ที่ถูกเลือก
  const selectedUserObjects = users.filter(user => teamList.includes(user.email));
  
  // แสดงผลอีเมลแบบย่อ (เฉพาะส่วนก่อน @)
  const formatEmailForDisplay = (email) => {
    if (!email) return '';
    return email.split('@')[0];
  };

  // Improved styles for better appearance
  const styles = {
    dropdownContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: '10px'
    },
    teamDisplay: {
      display: 'flex',
      alignItems: 'flex-start', // Changed from center to flex-start
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      backgroundColor: 'white',
      cursor: disabled ? 'not-allowed' : 'pointer',
      minHeight: '42px',
      maxHeight: '80px', // Added max height
      overflowY: 'auto', // Add scrolling for many members
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: dropdownOpen ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
      borderColor: dropdownOpen ? '#4f46e5' : '#e2e8f0'
    },
    placeholderDisplay: {
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    },
    placeholderAvatar: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: '#edf2f7',
      color: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '8px',
      fontWeight: 'bold',
      fontSize: '14px',
      flexShrink: 0 // Prevent shrinking
    },
    teamPlaceholder: {
      fontSize: '14px',
      color: '#718096'
    },
    dropdownArrow: {
      marginLeft: 'auto',
      fontSize: '12px',
      color: '#718096',
      transition: 'transform 0.2s',
      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      alignSelf: 'flex-start', // Keep at top
      marginTop: '5px' // Add some spacing from top
    },
    selectedTeamContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      flex: 1
    },
    selectedTeamMember: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f0f0ff',
      borderRadius: '4px',
      padding: '4px 8px',
      border: '1px solid #e6e6ff',
      marginBottom: '4px' // Add spacing between rows
    },
    selectedAvatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#4f46e5',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      flexShrink: 0 // Prevent shrinking
    },
    selectedEmail: {
      fontSize: '14px',
      color: '#4a5568',
      whiteSpace: 'nowrap', // Keep email on one line
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '120px' // Limit width of email display
    },
    dropdownMenu: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      maxHeight: '200px', // Reduced height
      overflowY: 'auto',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      zIndex: 999, // Increased z-index to ensure it appears above other content
      padding: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    searchContainer: {
      marginBottom: '8px'
    },
    searchInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none'
    },
    dropdownMessage: {
      padding: '12px 8px',
      color: '#718096',
      textAlign: 'center',
      fontSize: '14px'
    },
    dropdownError: {
      padding: '12px 8px',
      color: '#e53e3e',
      textAlign: 'center',
      fontSize: '14px',
      backgroundColor: '#fff5f5',
      borderRadius: '4px'
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 10px',
      cursor: 'pointer',
      borderRadius: '4px',
      marginBottom: '4px',
      transition: 'background-color 0.2s'
    },
    dropdownItemSelected: {
      backgroundColor: '#f0f0ff'
    },
    teamAvatarDropdown: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      backgroundColor: '#edf2f7',
      color: '#4a5568',
      fontWeight: 'bold',
      fontSize: '13px',
      flexShrink: 0 // Prevent shrinking
    },
    dropdownUserInfo: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden' // Prevent overflow
    },
    dropdownUserName: {
      fontSize: '14px',
      color: '#2d3748',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    dropdownUserFullname: {
      fontSize: '12px',
      color: '#718096',
      marginTop: '2px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    checkbox: {
      marginRight: '8px',
      width: '16px',
      height: '16px',
      accentColor: '#4f46e5',
      flexShrink: 0 // Prevent shrinking
    }
  };

  return (
    <div style={styles.dropdownContainer} ref={dropdownRef}>
      <div 
        style={styles.teamDisplay}
        onClick={() => {
          if (!disabled) setDropdownOpen(!dropdownOpen);
        }}
      >
        {selectedUserObjects.length === 0 ? (
          <div style={styles.placeholderDisplay}>
            <div style={styles.placeholderAvatar}>+</div>
            <div style={styles.teamPlaceholder}>Select team members</div>
          </div>
        ) : (
          <div style={styles.selectedTeamContainer}>
            {selectedUserObjects.map(user => (
              <div 
                key={`selected-${user.id || user.email}`}
                style={styles.selectedTeamMember}
              >
                <div style={styles.selectedAvatar}>
                  {getInitials(user.email)}
                </div>
                <span style={styles.selectedEmail}>
                  {formatEmailForDisplay(user.email)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={styles.dropdownArrow}>
          ▼
        </div>
      </div>
      
      {dropdownOpen && !disabled && (
        <div style={styles.dropdownMenu}>
          <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          {loading ? (
            <div style={styles.dropdownMessage}>
              Loading users...
            </div>
          ) : error ? (
            <div style={styles.dropdownError}>
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.dropdownMessage}>
              {searchTerm ? 'No users found matching search' : 'No users available'}
            </div>
          ) : (
            <div>
              {filteredUsers.map(user => {
                const isSelected = teamList.includes(user.email);
                return (
                  <div 
                    key={user.id || `user-${user.email}`}
                    style={{
                      ...styles.dropdownItem,
                      ...(isSelected ? styles.dropdownItemSelected : {})
                    }}
                    onClick={() => handleSelectUser(user)}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      style={styles.checkbox}
                    />
                    <div style={{
                      ...styles.teamAvatarDropdown,
                      ...(isSelected ? { backgroundColor: '#4f46e5', color: 'white' } : {})
                    }}>
                      {getInitials(user.email)}
                    </div>
                    <div style={styles.dropdownUserInfo}>
                      <div style={styles.dropdownUserName}>
                        {formatEmailForDisplay(user.email)}
                      </div>
                      {user.displayName && (
                        <div style={styles.dropdownUserFullname}>
                          {user.displayName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamMemberDropdown;