import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, UserPlus, Repeat, Bell, FileText } from 'lucide-react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField    from '@mui/material/TextField';
import axios from 'axios';
import dayjs from 'dayjs';
import './MeetingPage.css';

const EditMeetingModal = ({ open, handleClose, meeting, refreshMeetings }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    frequency: 'once',
    reminder: '10',
    participants: '',
    platform: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durations = [15, 30, 45, 60, 90, 120];

  useEffect(() => {
    if (!meeting) return;

    // Parse the ISO start_time and convert to Asia/Bangkok (UTC+7)
    const raw = meeting.start_time || '';
    const iso = raw.endsWith('Z') ? raw : `${raw}Z`;
    const dt = new Date(iso);

    const dateBKK = dt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    const timeBKK = dt.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });

    setFormData({
      title:        meeting.title || '',
      date:         dateBKK,
      time:         timeBKK,
      duration:     meeting.duration?.toString() || '60',
      frequency:    meeting.frequency || 'once',
      reminder:     meeting.reminder?.toString() || '10',
      participants: Array.isArray(meeting.participants)
        ? meeting.participants.join(', ')
        : '',
      platform:     meeting.platform || '',
      description:  meeting.description || ''
    });
  }, [meeting]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.platform) newErrors.platform = 'Platform is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlatformSelect = platform => {
    setFormData(prev => ({ ...prev, platform }));
    if (errors.platform) setErrors(prev => ({ ...prev, platform: null }));
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const start_time = dayjs(`${formData.date}T${formData.time}`).toISOString();
    const end_time   = dayjs(start_time).add(Number(formData.duration), 'minute').toISOString();

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        start_time,
        duration: Number(formData.duration),
        frequency: formData.frequency,
        reminder: Number(formData.reminder),
        participants: formData.participants
          ? formData.participants.split(',').map(p => p.trim()).filter(p => p)
          : [],
        platform: formData.platform
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/meeting/${meeting.id}`,
        payload
      );

      refreshMeetings();
      handleClose();
    } catch (err) {
      console.error('Failed to update meeting:', err);
      setErrors(prev => ({ ...prev, general: err.response?.data?.error || err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Meeting</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {errors.general && <div className="error-message">{errors.general}</div>}

          <div className="form-group">
            <label className="form-label">Meeting Title {errors.title && <span className="error-text">*{errors.title}</span>}</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className={`form-input ${errors.title ? 'input-error' : ''}`} placeholder="Enter meeting title" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Calendar size={16} className="input-icon" /> Date {errors.date && <span className="error-text">*{errors.date}</span>}</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}
                className={`form-input ${errors.date ? 'input-error' : ''}`} />
            </div>
            <div className="form-group">
              <label className="form-label"><Clock size={16} className="input-icon" /> Time {errors.time && <span className="error-text">*{errors.time}</span>}</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange}
                className={`form-input ${errors.time ? 'input-error' : ''}`} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Clock size={16} className="input-icon" /> Duration (minutes)</label>
              <Autocomplete
                freeSolo
                options={durations.map(d => d.toString())}      // รายการให้เลือก
                value={formData.duration?.toString() || ''}     // สะท้อนค่าที่กรอก/เลือก
                onInputChange={(e, v) =>                       // เมื่อเปลี่ยน ให้เรียก handleChange
                  handleChange({
                    target: { name: 'duration', value: v }
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="duration"
                    className="form-input"
                    placeholder="e.g. 60"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </div>
            <div className="form-group">
              <label className="form-label"><Repeat size={16} className="input-icon" /> Frequency</label>
              <select name="frequency" value={formData.frequency} onChange={handleChange} className="form-select">
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><Bell size={16} className="input-icon" /> Reminder</label>
              <select name="reminder" value={formData.reminder} onChange={handleChange} className="form-select">
                <option value="5">5 mins before</option>
                <option value="10">10 mins before</option>
                <option value="15">15 mins before</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><UserPlus size={16} className="input-icon" /> Participants (optional)</label>
            <input type="text" name="participants" value={formData.participants} onChange={handleChange}
              className="form-input" placeholder="alice@example.com, bob@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label"><FileText size={16} className="input-icon" /> Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
              className="form-textarea" placeholder="Optional: Add agenda or notes" />
          </div>
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</button>
          <button className="button button-primary" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeetingModal;