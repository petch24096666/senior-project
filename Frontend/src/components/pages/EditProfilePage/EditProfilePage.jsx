import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../context/Usercontext';
import { Avatar, Box } from '@mui/material';
import './EditProfilePage.css';

const UserProfilePage = () => {
  const { customUser, setCustomUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    company: '',
    location: '',
    email: '',
    phoneNumber: '',
    department: '',
    employeeId: '',
    dateJoined: '',
    reportingTo: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/users/me', {
          params: { userId: customUser.user_id }
        });
        const userData = response.data;
        setProfileData({
          fullName: userData.fullname || '',
          company: userData.company || '',
          location: userData.location || '',
          email: userData.email || '',
          phoneNumber: userData.phone_number || '',
          department: userData.department || '',
          employeeId: userData.employee_id || '',
          dateJoined: userData.created_at || '',
          reportingTo: userData.reporting_to || ''
        });
        setCustomUser(userData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (customUser?.user_id) {
      fetchUserProfile();
    }
  }, [customUser?.user_id]);

  const handleEditProfile = () => {
    setShowModal(true);
  };

  const closeModal = async () => {
    try {
      await axios.put('http://localhost:8081/api/users/me', {
        userId: customUser.user_id,
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        company: profileData.company,
        location: profileData.location,
        department: profileData.department,
        employeeId: profileData.employeeId,
        reportingTo: profileData.reportingTo
      });
      setCustomUser(prev => ({ ...prev, fullname: profileData.fullName }));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectAccount = (platform) => {
    let oauthUrl = '';
    switch (platform) {
      case 'zoom':
        oauthUrl = 'http://localhost:8081/api/oauth/zoom';  // เรียกไป Backend ➔ Backend redirect เอง
        break;
      case 'google':
        oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?...'; // Supabase จะดูทีหลัง
        break;
      case 'microsoft':
        oauthUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...'; // Supabase เช่นกัน
        break;
      default:
        return;
    }
    window.location.href = oauthUrl;
  };

  const getInitials = (email) => {
    if (!email) return '';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container">
      {/* Profile Header Card */}
      <div className="card">
        <div className="profile-header">
          {customUser?.email && (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              sx={{ marginBottom: '16px' }}
            >
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: "#4F46E5", 
                  fontSize: "32px", 
                  fontWeight: "bold" 
                }}
              >
                {getInitials(customUser.email)}
              </Avatar>
            </Box>
          )}
          <h1 className="profile-name">{profileData.fullName}</h1>
          <div className="meta-items">
            <div className="meta-item">
              <span className="meta-icon">🏢</span>
              {profileData.company}
            </div>
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              {profileData.location}
            </div>
          </div>
          <button className="edit-button" onClick={handleEditProfile}>
            <span>✏️</span> Edit Profile
          </button>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="card">
        <div className="section-grid">
          <div>
            <div className="section-title">Email Address</div>
            <div className="section-value">{profileData.email}</div>
          </div>
          <div>
            <div className="section-title">Phone Number</div>
            <div className="section-value">{profileData.phoneNumber}</div>
          </div>
          <div>
            <div className="section-title">Department</div>
            <div className="section-value">{profileData.department}</div>
          </div>
          <div>
            <div className="section-title">Employee ID</div>
            <div className="section-value">{profileData.employeeId}</div>
          </div>
          <div>
            <div className="section-title">Date Joined</div>
            <div className="section-value">{profileData.dateJoined}</div>
          </div>
          <div>
            <div className="section-title">Reporting To</div>
            <div className="section-value">{profileData.reportingTo}</div>
          </div>
        </div>
      </div>

      {/* Connected Accounts Card */}
      <div className="card">
        <h2 className="section-header">Connected Accounts</h2>
        {['Zoom', 'Google', 'Microsoft'].map((service) => (
          <div key={service} className="connected-service">
            <div className="service-info">
              <img src={`/api/placeholder/20/20`} alt={service} className="service-logo" />
              <div className="service-name">{service}</div>
            </div>
            <button 
              className="connect-button"
              onClick={() => handleConnectAccount(service.toLowerCase())}
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form>
              <input type="text" name="fullName" value={profileData.fullName} onChange={handleChange} placeholder="Full Name" className="modal-input" />
              <input type="email" name="email" value={profileData.email} onChange={handleChange} placeholder="Email Address" className="modal-input" />
              <input type="text" name="phoneNumber" value={profileData.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="modal-input" />
              <input type="text" name="company" value={profileData.company} onChange={handleChange} placeholder="Company" className="modal-input" />
              <input type="text" name="location" value={profileData.location} onChange={handleChange} placeholder="Location" className="modal-input" />
              <input type="text" name="department" value={profileData.department} onChange={handleChange} placeholder="Department" className="modal-input" />
              <input type="text" name="employeeId" value={profileData.employeeId} onChange={handleChange} placeholder="Employee ID" className="modal-input" />
              <input type="text" name="dateJoined" value={profileData.dateJoined} onChange={handleChange} placeholder="Date Joined" className="modal-input" />
              <input type="text" name="reportingTo" value={profileData.reportingTo} onChange={handleChange} placeholder="Reporting To" className="modal-input" />
              <div className="modal-buttons">
                <button type="button" className="save-button" onClick={closeModal}>Save</button>
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
