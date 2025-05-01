import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, FileText } from 'lucide-react';
import axios from 'axios';
import './MeetingPage.css';

const EditMeetingModal = ({ open, handleClose, meeting, refreshMeetings }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    platform: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        date: meeting.date || '',
        time: meeting.time || '',
        duration: meeting.duration?.toString() || '60',
        platform: meeting.platform || '',
        description: meeting.description || ''
      });
    }
  }, [meeting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.platform) newErrors.platform = "Platform is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlatformSelect = (platform) => {
    setFormData(prev => ({ ...prev, platform }));
    if (errors.platform) {
      setErrors(prev => ({ ...prev, platform: null }));
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/meeting/api/${meeting.id}`, formData);
      refreshMeetings();
      handleClose();
    } catch (err) {
      console.error('Failed to update meeting:', err);
      setErrors(prev => ({ 
        ...prev, 
        general: err.response?.data?.message || "Failed to update meeting. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Meeting</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          <div className="form-group">
            <label className="form-label">
              <span>Meeting Title</span>
              {errors.title && <span className="error-text">*{errors.title}</span>}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter meeting title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} className="input-icon" />
                <span>Date</span>
                {errors.date && <span className="error-text">*{errors.date}</span>}
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-input ${errors.date ? 'input-error' : ''}`}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} className="input-icon" />
                <span>Time</span>
                {errors.time && <span className="error-text">*{errors.time}</span>}
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`form-input ${errors.time ? 'input-error' : ''}`}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} className="input-icon" />
                <span>Duration (minutes)</span>
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="form-select"
              >
                {[15, 30, 45, 60, 90, 120].map(min => (
                  <option key={min} value={min}>{min} minutes</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Video size={16} className="input-icon" />
              <span>Platform</span>
              {errors.platform && <span className="error-text">*{errors.platform}</span>}
            </label>
            <div className="platform-grid">
              <div 
                className={`platform-card ${formData.platform === 'Zoom' ? 'selected' : ''}`}
                onClick={() => handlePlatformSelect('Zoom')}
              >
                <div className="platform-icon zoom-icon"></div>
                <div className="platform-info">
                  <span className="platform-name">Zoom</span>
                  <span className="platform-description">Video conferencing</span>
                </div>
              </div>
              <div 
                className={`platform-card ${formData.platform === 'Google Meet' ? 'selected' : ''}`}
                onClick={() => handlePlatformSelect('Google Meet')}
              >
                <div className="platform-icon meet-icon"></div>
                <div className="platform-info">
                  <span className="platform-name">Google Meet</span>
                  <span className="platform-description">Google's platform</span>
                </div>
              </div>
              <div 
                className={`platform-card ${formData.platform === 'Microsoft Teams' ? 'selected' : ''}`}
                onClick={() => handlePlatformSelect('Microsoft Teams')}
              >
                <div className="platform-icon teams-icon"></div>
                <div className="platform-info">
                  <span className="platform-name">Microsoft Teams</span>
                  <span className="platform-description">Microsoft's platform</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText size={16} className="input-icon" />
              <span>Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter meeting description"
              rows={3}
            ></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeetingModal;