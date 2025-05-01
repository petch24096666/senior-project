// src/frontend/pages/meeting/MeetingPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Video, Search, Filter, AlertCircle, ExternalLink } from 'lucide-react'; // <-- เพิ่ม ExternalLink
import { UserContext } from '../../../context/Usercontext';
import CreateMeetingModal from './CreateMeetingModal.jsx';
import EditMeetingModal from './EditMeetingModal.jsx';
import axios from 'axios';

import './MeetingPage.css';

const MeetingPage = () => {
  const { customUser } = useContext(UserContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMeetingData, setEditMeetingData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const fetchMeetings = async () => {
    if (!customUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // *** แก้ไข Endpoint การ fetch list ให้ถูกต้องตาม backend route ***
      // จาก meetingRoutes.js endpoint คือ /meeting และรับ userId เป็น query param
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/meeting?userId=${customUser.user_id}`);
      setMeetings(res.data); // response.data ควรจะเป็น array ของ meetings โดยตรง
      setError(null);
    } catch (err) {
      console.error('Failed to fetch meetings:', err.response?.data || err.message || err);
      setError('Failed to load your meetings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customUser) { // เรียก fetchMeetings เมื่อ customUser พร้อมใช้งาน
        fetchMeetings();
    } else {
        setLoading(false); // ถ้าไม่มี customUser ก็ไม่ต้อง loading
    }
  }, [customUser]); // Dependency คือ customUser

  const openEditModal = (meeting) => {
    setEditMeetingData(meeting);
    setEditModalOpen(true);
  };

  const confirmDelete = (meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!meetingToDelete) return;

    try {
      // *** แก้ไข Endpoint การ delete ให้ถูกต้องตาม backend route ***
      // จาก meetingRoutes.js endpoint คือ /meeting/:id
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/meeting/${meetingToDelete.id}`);
      showNotification('Meeting deleted successfully');
      fetchMeetings(); // โหลดข้อมูลใหม่หลังลบ
    } catch (err) {
      console.error('Failed to delete meeting:', err.response?.data || err.message || err);
      showNotification('Failed to delete meeting', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setMeetingToDelete(null); // เคลียร์ค่า meeting ที่จะลบ
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const title = meeting.title?.toLowerCase() || '';
    const platform = meeting.platform?.toLowerCase() || '';

    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || platform === platformFilter.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // --- *** แก้ไขการคำนวณ meetingStats ตรง microsoft *** ---
  const meetingStats = {
    total: meetings.length,
    zoom: meetings.filter(m => m.platform?.toLowerCase() === 'zoom').length,
    google: meetings.filter(m => m.platform?.toLowerCase() === 'google meet').length,
    microsoft: meetings.filter(m => m.platform?.toLowerCase() === 'microsoft teams').length, // <-- แก้ไขตรงนี้
  };
  // --- *** สิ้นสุดการแก้ไข meetingStats *** ---


  // Sort meetings by date and time (เรียงจากใกล้สุดไปไกลสุด)
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
      const dateA = a.date && a.time ? new Date(`${a.date}T${a.time}`) : 0;
      const dateB = b.date && b.time ? new Date(`${b.date}T${b.time}`) : 0;
      // จัดการกรณี date/time เป็น null หรือ invalid
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // ให้ meeting ที่ไม่มีวันที่/เวลาไปอยู่ท้ายๆ
      if (!dateB) return -1; // ให้ meeting ที่ไม่มีวันที่/เวลาไปอยู่ท้ายๆ
      return dateA - dateB;
  });


  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1 className="page-title">Meetings</h1>
            <p className="page-description">Overview and manage all your scheduled meetings</p>
          </div>
          <div className="header-actions">
            <button className="button button-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} /> Create Meeting
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon-purple"><Calendar size={24} /></div>
              <div className="stat-details">
                <h3 className="stat-label">Total Meetings</h3>
                <p className="stat-value">{meetingStats.total}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon-green"><Video size={24} /></div> {/* เปลี่ยน Icon เป็น Video */}
              <div className="stat-details">
              <h3 className="stat-label">Zoom</h3>
              <p className="stat-value">{meetingStats.zoom}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon-blue"><Video size={24} /></div>
              <div className="stat-details">
                <h3 className="stat-label">Google Meet</h3>
                <p className="stat-value">{meetingStats.google}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon-red"><Video size={24} /></div>
              <div className="stat-details">
                <h3 className="stat-label">Microsoft Teams</h3> {/* แก้ชื่อ Label */}
                <p className="stat-value">{meetingStats.microsoft}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filters-content">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters-right">
              <Filter size={18} className="filter-icon" />
              <select
                className="filter-select"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="All">All Platforms</option>
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Webex">Webex</option> {/* เพิ่ม Webex ถ้าใช้ */}
              </select>
            </div>
          </div>
        </div>

        {/* Meeting Cards */}
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
        ) : sortedMeetings.length > 0 ? (
          <div className="projects-grid"> {/* ใช้ projects-grid หรือ meetings-grid ตาม CSS */}
            {sortedMeetings.map(meeting => (
              <div key={meeting.id} className="project-card"> {/* ใช้ project-card หรือ meeting-card */}
                <div className="project-card-content">
                  <h3 className="project-title">{meeting.title}</h3>
                  <p className="project-description">{meeting.description || 'No description provided'}</p>
                  <div className="project-meta">
                    <div className="meta-item">
                      <Calendar size={16} className="meta-icon" />
                      {meeting.date} at {meeting.time}
                    </div>
                    <div className="meta-item">
                      <Clock size={16} className="meta-icon" />
                      {meeting.duration} mins
                    </div>
                    <div className="meta-item">
                      <Video size={16} className="meta-icon" />
                      {meeting.platform}
                    </div>
                    {/* --- *** เพิ่มส่วนแสดง Link *** --- */}
                    {meeting.join_url && meeting.join_url.startsWith('http') && ( // เช็คว่ามี URL และขึ้นต้นด้วย http
                      <div className="meta-item meta-link">
                        <ExternalLink size={16} className="meta-icon" />
                        <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="meeting-url">
                          Join Meeting
                        </a>
                      </div>
                    )}
                    {/* --- *** สิ้นสุดส่วนแสดง Link *** --- */}
                  </div>
                  <div className="project-card-actions">
                    <button className="action-button" onClick={() => openEditModal(meeting)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-button action-delete" onClick={() => confirmDelete(meeting)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-content">
              <Calendar size={48} className="empty-icon" />
              <h3 className="empty-title">No meetings found</h3>
              <p className="empty-message">
                {searchTerm || platformFilter !== 'All'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first meeting to get started'}
              </p>
              {!searchTerm && platformFilter === 'All' && (
                <button className="button button-primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={18} /> Create Meeting
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateMeetingModal
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              fetchMeetings(); // โหลดข้อมูลใหม่หลังสร้างสำเร็จ
              showNotification('Meeting created successfully');
            }}
          />
        )}

        {editModalOpen && (
          <EditMeetingModal
            open={editModalOpen}
            handleClose={() => setEditModalOpen(false)}
            meeting={editMeetingData}
            refreshMeetings={() => {
              fetchMeetings(); // โหลดข้อมูลใหม่หลังแก้ไขสำเร็จ
              showNotification('Meeting updated successfully');
            }}
          />
        )}

        {/* Confirm Delete Modal */}
        {deleteDialogOpen && (
          <div className="modal-overlay">
            <div className="confirm-dialog">
              <h3 className="dialog-title">Confirm Deletion</h3>
              <p className="dialog-message">
                Are you sure you want to delete "{meetingToDelete?.title}"?
              </p>
              <div className="dialog-actions">
                <button className="button button-secondary" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </button>
                <button className="button button-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingPage;