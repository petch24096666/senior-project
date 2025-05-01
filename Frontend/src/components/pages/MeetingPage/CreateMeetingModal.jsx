// src/frontend/components/meetings/CreateMeetingModal.jsx

import React, { useState, useContext } from 'react';
import { X, Calendar, Clock, Video, UserPlus, Repeat, Bell, FileText } from 'lucide-react';
import axios from 'axios';
import { UserContext } from '../../../context/Usercontext'; // ตรวจสอบ Path ให้ถูกต้อง
import dayjs from 'dayjs';
import './MeetingPage.css'; // ตรวจสอบ Path ให้ถูกต้อง
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const CreateMeetingModal = ({ onClose, onSuccess }) => {
  const { customUser } = useContext(UserContext);
  const supabase = useSupabaseClient();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    platform: '', // Zoom, Google Meet, Microsoft Teams, Webex
    frequency: 'once',
    reminder: '10',
    participants: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const start_time = dayjs(`${formData.date}T${formData.time}`).toISOString();
    const end_time = dayjs(start_time).add(Number(formData.duration), 'minute').toISOString();

    let providerToken = null;
    let sessionData = null; // เก็บ session ไว้เผื่อ debug

    // ดึง Provider Token ถ้าเลือก Google Meet หรือ Microsoft Teams
    if (formData.platform === 'Google Meet' || formData.platform === 'Microsoft Teams') {
      try {
        console.log('Attempting to get Supabase session...');
        // ลอง refresh session ก่อน เผื่อ token หมดอายุ (อาจจะไม่จำเป็นเสมอไป แต่ช่วยบางกรณี)
        // const { error: refreshError } = await supabase.auth.refreshSession();
        // if (refreshError) console.warn('Session refresh attempt failed:', refreshError.message);

        // ดึง session ล่าสุด
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        sessionData = session; // เก็บ session ไว้

        // Log session ที่ได้มา (สำคัญมากสำหรับ Debug)
        console.log('Supabase Session Object:', JSON.stringify(session, null, 2));

        if (sessionError) {
          throw new Error(`Error getting session: ${sessionError.message}`);
        }
        if (!session) {
          throw new Error('No active session found. Please log in again.');
        }

        // --- ตรวจสอบ provider_token ---
        if (!session.provider_token) {
            console.error('Provider token NOT found in session object:', session); // Log session ที่ไม่มี token
            throw new Error(`Could not find ${formData.platform} token in the current session. Please ensure you are correctly logged in with ${formData.platform} and necessary permissions were granted. Try logging out and back in.`);
        }
        // --- สิ้นสุดการตรวจสอบ ---

        providerToken = session.provider_token; // ใช้ Token จาก session
        console.log(`Using ${formData.platform} Provider Token (First 10 chars):`, providerToken.substring(0, 10) + '...');

      } catch (err) {
         console.error('Error handling session or provider token:', err);
         // แสดง Error ที่ละเอียดขึ้นให้ User
         setErrors(prev => ({ ...prev, general: err.message || 'Error fetching authentication details.' }));
         setIsSubmitting(false);
         return;
      }
    }

    // เตรียมข้อมูลและเรียก Backend API
    try {
      const body = {
        title: formData.title,
        description: formData.description,
        start_time,
        end_time,
        duration: Number(formData.duration),
        frequency: formData.frequency,
        reminder: formData.reminder,
        participants: formData.participants.trim() ? formData.participants.split(',').map(p => p.trim()).filter(p => p) : [],
        platform: formData.platform,
        user_id: customUser?.user_id,
        token: providerToken, // ส่ง Token ที่ได้จาก getSession()
      };

      if (!body.user_id) {
        throw new Error('User information is missing. Cannot create meeting.');
      }

      console.log("Sending request body to backend:", { ...body, token: body.token ? body.token.substring(0,10)+'...' : undefined });

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/meeting`, body);

      console.log("Backend response:", response.data);

      onSuccess?.();
      onClose();

    } catch (err) {
      console.error('Create meeting failed (API call or final processing):', err.response?.data || err.message || err);
      setErrors(prev => ({ ...prev, general: err.response?.data?.error || err.message || 'Failed to create meeting. Please check details and try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ส่วน JSX ไม่ได้แก้ไข ---
  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Schedule a Meeting</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {errors.general && <div className="error-message">{errors.general}</div>}

          {/* --- Form fields --- */}
          <div className="form-group">
            <label className="form-label">Meeting Title {errors.title && <span className="error-text">*{errors.title}</span>}</label>
            <input type="text" name="title" className={`form-input ${errors.title ? 'input-error' : ''}`} value={formData.title} onChange={handleChange} placeholder="Enter meeting title" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Calendar size={16} className="input-icon" /> Date {errors.date && <span className="error-text">*{errors.date}</span>}</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className={`form-input ${errors.date ? 'input-error' : ''}`} min={dayjs().format('YYYY-MM-DD')} />
            </div>
            <div className="form-group">
              <label className="form-label"><Clock size={16} className="input-icon" /> Time {errors.time && <span className="error-text">*{errors.time}</span>}</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className={`form-input ${errors.time ? 'input-error' : ''}`} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select name="duration" className="form-select" value={formData.duration} onChange={handleChange}>
                {[15, 30, 45, 60, 90, 120].map(min => <option key={min} value={min}>{min} mins</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Repeat size={16} className="input-icon" /> Frequency</label>
              <select name="frequency" className="form-select" value={formData.frequency} onChange={handleChange}>
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><Bell size={16} className="input-icon" /> Reminder</label>
              <select name="reminder" className="form-select" value={formData.reminder} onChange={handleChange}>
                <option value="5">5 mins before</option>
                <option value="10">10 mins before</option>
                <option value="15">15 mins before</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><UserPlus size={16} className="input-icon" /> Participants (comma separated emails)</label>
            <input type="text" name="participants" className="form-input" value={formData.participants} onChange={handleChange} placeholder="example@email.com, another@email.com" />
          </div>

          <div className="form-group">
            <label className="form-label"><Video size={16} className="input-icon" /> Platform {errors.platform && <span className="error-text">*{errors.platform}</span>}</label>
            <div className="platform-grid">
              {['Zoom', 'Google Meet', 'Microsoft Teams', 'Webex'].map((platform) => (
                <div
                  key={platform}
                  className={`platform-card ${formData.platform === platform ? 'selected' : ''}`}
                  onClick={() => handlePlatformSelect(platform)}
                >
                  <div className={`platform-icon ${platform.toLowerCase().replace(/\s+/g, '-')}-icon`} />
                  <div className="platform-info">
                    <span className="platform-name">{platform}</span>
                  </div>
                </div>
              ))}
            </div>
             {errors.platform && <div className="error-text error-block">{errors.platform}</div>}
          </div>

          <div className="form-group">
            <label className="form-label"><FileText size={16} className="input-icon" /> Description</label>
            <textarea name="description" className="form-textarea" value={formData.description} onChange={handleChange} rows={3} placeholder="Optional: Add agenda or notes"></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="button button-primary" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;