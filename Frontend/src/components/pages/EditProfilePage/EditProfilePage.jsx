import React, { useState } from 'react';

const ProjectFlowProfile = () => {
  
  // State for edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State for user profile data
  const [profileData, setProfileData] = useState({
    name: "Sarah Anderson",
    jobTitle: "Senior Product Designer",
    email: "sarah.anderson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    timeZone: "Pacific Time (PT)",
    department: "Product Design",
    reportsTo: "Michael Chen (Design Director)",
    startDate: "March 15, 2023",
    workSchedule: "Monday - Friday, 9:00 AM - 5:00 PM PT",
    skills: ["UI Design", "UX Research", "Figma", "Design Systems"],
    projects: ["Mobile App Redesign", "Design System"]
  });
  
  // State for form inputs
  const [formInputs, setFormInputs] = useState({...profileData});
  
  // State for connected apps
  const [connectedApps, setConnectedApps] = useState({
    zoom: false,
    github: false,
    google: false,
    microsoft: false,
    figma: false,
    slack: false,
    jira: false
  });
  
  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs({
      ...formInputs,
      [name]: value
    });
  };
  
  // Save profile changes
  const saveProfile = () => {
    setProfileData({...formInputs});
    setShowEditModal(false);
  };
  
  // Toggle app connection
  const toggleAppConnection = (appName) => {
    setConnectedApps({
      ...connectedApps,
      [appName]: !connectedApps[appName]
    });
  };
  
  // App list data
  const apps = [
    { id: "zoom", name: "Zoom", description: "Video conferencing", icon: "Z" },
    { id: "github", name: "GitHub", description: "Codebase integration", icon: "G" },
    { id: "google", name: "Google", description: "Email and calendar integration", icon: "G" },
    { id: "microsoft", name: "Microsoft", description: "Office integration", icon: "M" },
    { id: "figma", name: "Figma", description: "Design tool", icon: "F" },
    { id: "slack", name: "Slack", description: "Team communication", icon: "S" },
    { id: "jira", name: "Jira", description: "Project management", icon: "J" }
  ];
  
  // Style objects
  const styles = {
    body: {
      backgroundColor: "#f5f7fa",
      color: "#333",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      margin: 0,
      padding: 0,
      boxSizing: "border-box"
    },
    navbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 24px",
      backgroundColor: "#fff",
      borderBottom: "1px solid #e1e4e8"
    },
    logo: {
      display: "flex",
      alignItems: "center",
      fontWeight: "600",
      color: "#4263eb",
      fontSize: "18px",
      cursor: "pointer"
    },
    logoIcon: {
      marginRight: "8px",
      backgroundColor: "#4263eb",
      color: "white",
      width: "24px",
      height: "24px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    navRight: {
      display: "flex",
      alignItems: "center",
      gap: "16px"
    },
    navIcon: {
      position: "relative",
      cursor: "pointer"
    },
    badge: {
      position: "absolute",
      top: "-5px",
      right: "-5px",
      backgroundColor: "#fa5252",
      color: "white",
      fontSize: "10px",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "24px"
    },
    profileContainer: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "24px",
      marginBottom: "24px"
    },
    profileHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "24px",
      justifyContent: "space-between"
    },
    profileInfo: {
      display: "flex",
      gap: "16px"
    },
    avatar: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      backgroundColor: "#e9ecef",
      overflow: "hidden"
    },
    avatarImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    userDetails: {
      display: "flex",
      flexDirection: "column"
    },
    userName: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "4px"
    },
    jobTitle: {
      color: "#6c757d",
      fontSize: "14px",
      marginBottom: "8px"
    },
    tags: {
      display: "flex",
      gap: "8px"
    },
    tag: {
      backgroundColor: "#e7f5ff",
      color: "#339af0",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px"
    },
    editButton: {
      backgroundColor: "#4263eb",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s ease"
    },
    editButtonHover: {
      backgroundColor: "#3b5bdb",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
    },
    profileContent: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px"
    },
    contactSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px"
    },
    profileSection: {
      marginBottom: "16px"
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#495057",
      marginBottom: "8px"
    },
    sectionContent: {
      fontSize: "14px",
      color: "#212529"
    },
    workSection: {
      marginTop: "16px"
    },
    workInfo: {
      marginBottom: "16px"
    },
    skillsList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "8px"
    },
    skillTag: {
      backgroundColor: "#f1f3f5",
      padding: "6px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      cursor: "pointer"
    },
    skillTagHover: {
      backgroundColor: "#e7f5ff",
      color: "#1971c2"
    },
    projectTag: {
      display: "inline-block",
      marginTop: "8px",
      marginRight: "8px",
      backgroundColor: "#e7f5ff",
      color: "#339af0",
      padding: "6px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      textDecoration: "none",
      cursor: "pointer"
    },
    connectedApps: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "24px"
    },
    appsTitle: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "16px"
    },
    appList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    appItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "16px",
      borderBottom: "1px solid #e9ecef"
    },
    appInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    appIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      backgroundColor: "#f8f9fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    },
    appDetails: {
      display: "flex",
      flexDirection: "column"
    },
    appName: {
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "2px"
    },
    appDescription: {
      fontSize: "12px",
      color: "#6c757d"
    },
    connectBtn: {
      backgroundColor: "#f8f9fa",
      border: "1px solid #dee2e6",
      color: "#495057",
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      transition: "all 0.2s ease",
      cursor: "pointer"
    },
    connectBtnHover: {
      backgroundColor: "#e9ecef",
      borderColor: "#ced4da"
    },
    connectedBtn: {
      backgroundColor: "#d3f9d8",
      color: "#2b8a3e",
      borderColor: "#b2f2bb",
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      transition: "all 0.2s ease",
      cursor: "pointer"
    },
    connectedBtnHover: {
      backgroundColor: "#c0f8c9",
      borderColor: "#a0e9ad"
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "20px",
      cursor: "pointer"
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "100",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    modalContent: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "8px",
      width: "100%",
      maxWidth: "600px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px"
    },
    modalTitle: {
      fontSize: "18px",
      fontWeight: "600"
    },
    formGroup: {
      marginBottom: "16px"
    },
    formLabel: {
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "500"
    },
    formInput: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ced4da",
      borderRadius: "4px",
      fontSize: "14px"
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px"
    },
    formCancel: {
      backgroundColor: "#f8f9fa",
      border: "1px solid #dee2e6",
      color: "#495057",
      padding: "8px 16px",
      borderRadius: "4px",
      fontSize: "14px",
      cursor: "pointer"
    },
    formSave: {
      backgroundColor: "#4263eb",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      fontSize: "14px",
      cursor: "pointer"
    },
    formSaveHover: {
      backgroundColor: "#3b5bdb"
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Profile Container */}
        <div style={styles.profileContainer}>
          <div style={styles.profileHeader}>
            <div style={styles.profileInfo}>
              <div style={styles.avatar}>
                <img 
                  src="/api/placeholder/64/64" 
                  alt={profileData.name} 
                  style={styles.avatarImg}
                />
              </div>
              <div style={styles.userDetails}>
                <h2 style={styles.userName}>{profileData.name}</h2>
                <p style={styles.jobTitle}>{profileData.jobTitle}</p>
                <div style={styles.tags}>
                  <span style={styles.tag}>Available</span>
                  <span style={styles.tag}>Employed at ProductCo</span>
                </div>
              </div>
            </div>
            <button 
              style={styles.editButton}
              onClick={() => setShowEditModal(true)}
              onMouseOver={(e) => Object.assign(e.target.style, styles.editButtonHover)}
              onMouseOut={(e) => Object.assign(e.target.style, styles.editButton)}
            >
              Edit Profile
            </button>
          </div>
          
          <div style={styles.profileContent}>
            <div>
              <div style={styles.contactSection}>
                <div style={styles.profileSection}>
                  <div style={styles.sectionTitle}>Email</div>
                  <div style={styles.sectionContent}>{profileData.email}</div>
                </div>
                <div style={styles.profileSection}>
                  <div style={styles.sectionTitle}>Phone</div>
                  <div style={styles.sectionContent}>{profileData.phone}</div>
                </div>
                <div style={styles.profileSection}>
                  <div style={styles.sectionTitle}>Location</div>
                  <div style={styles.sectionContent}>{profileData.location}</div>
                </div>
                <div style={styles.profileSection}>
                  <div style={styles.sectionTitle}>Time Zone</div>
                  <div style={styles.sectionContent}>{profileData.timeZone}</div>
                </div>
              </div>
              
              <div style={styles.workSection}>
                <div style={styles.workInfo}>
                  <div style={styles.sectionTitle}>Department</div>
                  <div style={styles.sectionContent}>{profileData.department}</div>
                </div>
                
                <div style={styles.workInfo}>
                  <div style={styles.sectionTitle}>Reports To</div>
                  <div style={styles.sectionContent}>{profileData.reportsTo}</div>
                </div>
                
                <div style={styles.workInfo}>
                  <div style={styles.sectionTitle}>Start Date</div>
                  <div style={styles.sectionContent}>{profileData.startDate}</div>
                </div>
                
                <div style={styles.workInfo}>
                  <div style={styles.sectionTitle}>Work Schedule</div>
                  <div style={styles.sectionContent}>{profileData.workSchedule}</div>
                </div>
              </div>
            </div>
            
            <div>
              <div>
                <div style={styles.sectionTitle}>Skills</div>
                <div style={styles.skillsList}>
                  {profileData.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      style={styles.skillTag}
                      onMouseOver={(e) => Object.assign(e.target.style, styles.skillTagHover)}
                      onMouseOut={(e) => Object.assign(e.target.style, styles.skillTag)}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{marginTop: "16px"}}>
                <div style={styles.sectionTitle}>Current Projects</div>
                <div>
                  {profileData.projects.map((project, index) => (
                    <a 
                      href="#" 
                      key={index} 
                      style={styles.projectTag}
                      onMouseOver={(e) => Object.assign(e.target.style, styles.skillTagHover)}
                      onMouseOut={(e) => Object.assign(e.target.style, styles.projectTag)}
                    >
                      {project}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Connected Apps */}
        <div style={styles.connectedApps}>
          <h3 style={styles.appsTitle}>Connected Applications</h3>
          
          <div style={styles.appList}>
            {apps.map((app) => (
              <div key={app.id} style={styles.appItem}>
                <div style={styles.appInfo}>
                  <div style={styles.appIcon}>{app.icon}</div>
                  <div style={styles.appDetails}>
                    <h4 style={styles.appName}>{app.name}</h4>
                    <p style={styles.appDescription}>{app.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAppConnection(app.id)}
                  style={connectedApps[app.id] ? styles.connectedBtn : styles.connectBtn}
                  onMouseOver={(e) => Object.assign(
                    e.target.style, 
                    connectedApps[app.id] ? styles.connectedBtnHover : styles.connectBtnHover
                  )}
                  onMouseOut={(e) => Object.assign(
                    e.target.style, 
                    connectedApps[app.id] ? styles.connectedBtn : styles.connectBtn
                  )}
                >
                  {connectedApps[app.id] ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Profile</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Name</label>
                <input 
                  type="text" 
                  name="name"
                  style={styles.formInput} 
                  value={formInputs.name}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Job Title</label>
                <input 
                  type="text" 
                  name="jobTitle"
                  style={styles.formInput} 
                  value={formInputs.jobTitle}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email</label>
                <input 
                  type="email" 
                  name="email"
                  style={styles.formInput} 
                  value={formInputs.email}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  style={styles.formInput} 
                  value={formInputs.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Location</label>
                <input 
                  type="text" 
                  name="location"
                  style={styles.formInput} 
                  value={formInputs.location}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.formCancel}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  style={styles.formSave}
                  onClick={saveProfile}
                  onMouseOver={(e) => Object.assign(e.target.style, styles.formSaveHover)}
                  onMouseOut={(e) => Object.assign(e.target.style, styles.formSave)}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFlowProfile;