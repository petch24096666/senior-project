import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Edit, Trash2, Clock, Video, ExternalLink, AlertCircle } from 'lucide-react';
import { UserContext } from "../../../context/Usercontext.jsx";
import EditMeetingModal from './EditMeetingModal';
import './MeetingList.css';

const MeetingList = () => {
  const { customUser } = useContext(UserContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMeetingData, setEditMeetingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const fetchMeetings = async () => {
    if (!customUser) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/meeting/api/${customUser.user_id}`);
      setMeetings(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch meetings:', err.response?.data || err.message);
      setError('Failed to load your meetings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [customUser]);

  const handleDelete = async () => {
    if (!selectedMeeting) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/meeting/api/${selectedMeeting.id}`);
      setMeetings(prev => prev.filter((m) => m.id !== selectedMeeting.id));
      showNotification('Meeting deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      showNotification('Failed to delete meeting', 'error');
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (meeting) => {
    setEditMeetingData(meeting);
    setEditModalOpen(true);
  };

  const openDeleteDialog = (meeting) => {
    setSelectedMeeting(meeting);
    setIsDialogOpen(true);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  // Group meetings by upcoming dates
  const todayDate = new Date().toISOString().split('T')[0];
  const upcomingMeetings = meetings.filter(m => m.date >= todayDate);
  const pastMeetings = meetings.filter(m => m.date < todayDate);

  // Sort meetings by date and time
  const sortedUpcoming = [...upcomingMeetings].sort((a, b) => 
    new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );
  
  const sortedPast = [...pastMeetings].sort((a, b) => 
    new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
  );

  return (
    <div className="meeting-list-container">
      <div className="meeting-list-header">
        <div>
          <h1 className="meeting-list-title">My Meetings</h1>
          <p className="meeting-list-subtitle">Manage and edit your scheduled meetings</p>
        </div>
        <button className="create-meeting-btn" onClick={() => navigate('/meeting')}>
          <Plus size={18} /> Create New Meeting
        </button>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your meetings...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertCircle size={32} className="error-icon" />
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchMeetings}>
            Try Again
          </button>
        </div>
      ) : meetings.length === 0 ? (
        <div className="empty-state">
          <Calendar className="empty-state-bigicon" />
          <div className="empty-state-message">You haven't scheduled any meetings yet.</div>
          <button className="empty-state-cta" onClick={() => navigate('/meeting')}>
            Create Your First Meeting
          </button>
        </div>
      ) : (
        <div className="meetings-container">
          {sortedUpcoming.length > 0 && (
            <div className="meeting-section">
              <h2 className="section-title">Upcoming Meetings</h2>
              <div className="meeting-list">
                {sortedUpcoming.map((meeting) => (
                  <div key={meeting.id} className="meeting-card">
                    <div className="meeting-card-header">
                      <h3 className="meeting-title">{meeting.title}</h3>
                      <div className="meeting-actions">
                        <button className="edit-btn" onClick={() => handleEdit(meeting)}>
                          <Edit size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => openDeleteDialog(meeting)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="meeting-details">
                      <div className="meeting-detail">
                        <Calendar size={16} className="detail-icon" />
                        {meeting.date} at {meeting.time}
                      </div>
                      <div className="meeting-detail">
                        <Clock size={16} className="detail-icon" />
                        {meeting.duration} minutes
                      </div>
                      <div className="meeting-detail">
                        <Video size={16} className="detail-icon" />
                        {meeting.platform}
                      </div>
                      {meeting.join_url && (
                        <div className="meeting-detail meeting-link">
                          <ExternalLink size={16} className="detail-icon" />
                          <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="meeting-url">
                            Join Meeting
                          </a>
                        </div>
                      )}
                      {meeting.description && (
                        <div className="meeting-description">
                          {meeting.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedPast.length > 0 && (
            <div className="meeting-section past-meetings">
              <h2 className="section-title">Past Meetings</h2>
              <div className="meeting-list">
                {sortedPast.map((meeting) => (
                  <div key={meeting.id} className="meeting-card past-meeting-card">
                    <div className="meeting-card-header">
                      <h3 className="meeting-title">{meeting.title}</h3>
                      <div className="meeting-actions">
                        <button className="delete-btn" onClick={() => openDeleteDialog(meeting)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="meeting-details">
                      <div className="meeting-detail">
                        <Calendar size={16} className="detail-icon" />
                        {meeting.date} at {meeting.time}
                      </div>
                      <div className="meeting-detail">
                        <Clock size={16} className="detail-icon" />
                        {meeting.duration} minutes
                      </div>
                      <div className="meeting-detail">
                        <Video size={16} className="detail-icon" />
                        {meeting.platform}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {isDialogOpen && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h3 className="dialog-title">Confirm Deletion</h3>
            <p className="dialog-message">
              Are you sure you want to delete "{selectedMeeting?.title}"?
            </p>
            <div className="dialog-actions">
              <button className="button button-secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </button>
              <button className="button button-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <EditMeetingModal
          open={editModalOpen}
          handleClose={() => setEditModalOpen(false)}
          meeting={editMeetingData}
          refreshMeetings={fetchMeetings}
        />
      )}
    </div>
  );
};

export default MeetingList;