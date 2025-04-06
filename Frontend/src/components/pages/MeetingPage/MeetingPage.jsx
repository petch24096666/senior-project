import React, { useState } from 'react';

const MeetingApp = () => {
  // State for managing meetings
  const [meetings, setMeetings] = useState([
    { 
      id: 1, 
      title: 'Weekly Team Standup', 
      date: '2025-03-29', 
      startTime: '09:00', 
      endTime: '09:30',
      participants: ['Jessica Williams', 'Michael Chen', 'Sarah Johnson'],
      description: 'Regular team sync to discuss progress and blockers',
      meetingCode: 'MEET-4321'
    },
    { 
      id: 2, 
      title: 'Product Review', 
      date: '2025-03-29', 
      startTime: '13:00', 
      endTime: '14:00',
      participants: ['David Miller', 'Emily Davis', 'Jessica Williams'],
      description: 'Review the latest product features and gather feedback',
      meetingCode: 'MEET-8765'
    },
    { 
      id: 3, 
      title: 'Client Presentation', 
      date: '2025-03-30', 
      startTime: '11:00', 
      endTime: '12:00',
      participants: ['Sarah Johnson', 'Michael Chen'],
      description: 'Present the new website design to the client',
      meetingCode: 'MEET-9876'
    }
  ]);
  
  // State for create meeting form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    participants: '',
    description: ''
  });
  
  // State for join meeting popup
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showMeetingDetails, setShowMeetingDetails] = useState(null);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting({
      ...newMeeting,
      [name]: value
    });
  };
  
  // Create new meeting
  const handleCreateMeeting = (e) => {
    e.preventDefault();
    
    // Generate random meeting code
    const meetingCode = 'MEET-' + Math.floor(1000 + Math.random() * 9000);
    
    const participantList = newMeeting.participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p !== '');
    
    const createdMeeting = {
      id: meetings.length + 1,
      title: newMeeting.title,
      date: newMeeting.date,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      participants: participantList,
      description: newMeeting.description,
      meetingCode: meetingCode
    };
    
    setMeetings([...meetings, createdMeeting]);
    
    // Reset form
    setNewMeeting({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      participants: '',
      description: ''
    });
    
    setShowCreateForm(false);
    
    // Show meeting details of the newly created meeting
    setShowMeetingDetails(createdMeeting);
  };
  
  // Join meeting
  const handleJoinMeeting = () => {
    const meeting = meetings.find(m => m.meetingCode === joinCode);
    
    if (meeting) {
      setShowJoinPopup(false);
      setShowMeetingDetails(meeting);
    } else {
      alert('Meeting not found. Please check the code and try again.');
    }
  };
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter meetings based on active tab
  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'upcoming') {
      return new Date(meeting.date) >= new Date(today);
    } else if (activeTab === 'past') {
      return new Date(meeting.date) < new Date(today);
    }
    return true;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>MeetingMaster</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{
              backgroundColor: 'white',
              color: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setShowJoinPopup(true)}
          >
            Join Meeting
          </button>
          <button 
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onClick={() => setShowCreateForm(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Meeting
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '20px', 
        backgroundColor: '#f5f7fb',
        overflow: 'auto'
      }}>
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb', 
          marginBottom: '20px' 
        }}>
          <button 
            style={{
              padding: '10px 16px',
              backgroundColor: activeTab === 'upcoming' ? '#3b82f6' : 'transparent',
              color: activeTab === 'upcoming' ? 'white' : '#4b5563',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Meetings
          </button>
          <button 
            style={{
              padding: '10px 16px',
              backgroundColor: activeTab === 'past' ? '#3b82f6' : 'transparent',
              color: activeTab === 'past' ? 'white' : '#4b5563',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginLeft: '5px'
            }}
            onClick={() => setActiveTab('past')}
          >
            Past Meetings
          </button>
        </div>
        
        {/* Meeting List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredMeetings.map(meeting => (
            <div 
              key={meeting.id} 
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '16px',
                cursor: 'pointer'
              }}
              onClick={() => setShowMeetingDetails(meeting)}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: '#1f2937',
                  fontSize: '18px'
                }}>
                  {meeting.title}
                </h3>
                <span style={{
                  backgroundColor: '#e5e7eb',
                  color: '#4b5563',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {meeting.meetingCode}
                </span>
              </div>
              
              <p style={{ 
                margin: '0 0 8px 0', 
                color: '#4b5563',
                fontWeight: 'bold'
              }}>
                {formatDate(meeting.date)}
              </p>
              
              <p style={{ 
                margin: '0 0 8px 0', 
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {meeting.startTime} - {meeting.endTime}
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '5px', 
                marginTop: '10px' 
              }}>
                {meeting.participants.slice(0, 3).map((participant, index) => (
                  <span 
                    key={index}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {participant}
                  </span>
                ))}
                {meeting.participants.length > 3 && (
                  <span 
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    +{meeting.participants.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Create Meeting Form */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Create New Meeting</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateMeeting}>
              <div style={{ marginBottom: '15px' }}>
                <label 
                  style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}
                >
                  Meeting Title
                </label>
                <input 
                  type="text"
                  name="title"
                  value={newMeeting.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}
                >
                  Date
                </label>
                <input 
                  type="date"
                  name="date"
                  value={newMeeting.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '15px' 
              }}>
                <div style={{ flex: 1 }}>
                  <label 
                    style={{ 
                      display: 'block', 
                      marginBottom: '5px', 
                      color: '#4b5563', 
                      fontWeight: 'bold' 
                    }}
                  >
                    Start Time
                  </label>
                  <input 
                    type="time"
                    name="startTime"
                    value={newMeeting.startTime}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label 
                    style={{ 
                      display: 'block', 
                      marginBottom: '5px', 
                      color: '#4b5563', 
                      fontWeight: 'bold' 
                    }}
                  >
                    End Time
                  </label>
                  <input 
                    type="time"
                    name="endTime"
                    value={newMeeting.endTime}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}
                >
                  Participants (comma separated)
                </label>
                <input 
                  type="text"
                  name="participants"
                  value={newMeeting.participants}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe, Jane Smith"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label 
                  style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    color: '#4b5563', 
                    fontWeight: 'bold' 
                  }}
                >
                  Description
                </label>
                <textarea 
                  name="description"
                  value={newMeeting.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <button 
                type="submit"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Create Meeting
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Join Meeting Popup */}
      {showJoinPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Join Meeting</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setShowJoinPopup(false)}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label 
                style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  color: '#4b5563', 
                  fontWeight: 'bold' 
                }}
              >
                Meeting Code
              </label>
              <input 
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter meeting code (e.g. MEET-1234)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <button 
              onClick={handleJoinMeeting}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Join
            </button>
          </div>
        </div>
      )}
      
      {/* Meeting Details */}
      {showMeetingDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, color: '#1f2937' }}>Meeting Details</h2>
                <span style={{
                  backgroundColor: '#e5e7eb',
                  color: '#4b5563',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {showMeetingDetails.meetingCode}
                </span>
              </div>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setShowMeetingDetails(null)}
              >
                ×
              </button>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
                {showMeetingDetails.title}
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4b5563',
                marginBottom: '5px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{formatDate(showMeetingDetails.date)}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4b5563',
                marginBottom: '5px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{showMeetingDetails.startTime} - {showMeetingDetails.endTime}</span>
              </div>
              
              {showMeetingDetails.description && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {showMeetingDetails.description}
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: '#1f2937',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Participants ({showMeetingDetails.participants.length})
              </h4>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px' 
              }}>
                {showMeetingDetails.participants.map((participant, index) => (
                  <div 
                    key={index}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {participant.charAt(0)}
                    </div>
                    {participant}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <button 
                onClick={() => {
                  setShowMeetingDetails(null);
                  // In a real app, this would delete the meeting
                }}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Delete Meeting
              </button>
              <button 
                onClick={() => {
                  alert(`Joining meeting: ${showMeetingDetails.meetingCode}`);
                  // In a real app, this would start the meeting
                }}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Start Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingApp;