import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MeetingPage.css';
import { UserContext } from '../../../context/Usercontext';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {
  Calendar, Clock, Video, MessageCircle,
  Users, Bell, Repeat, CheckCircle, Link, List
} from 'lucide-react';

const MeetingPage = () => {
  const [formData, setFormData] = useState({
    title: '', date: '', time: '', duration: '60',
    platform: '', frequency: 'once', reminderTime: '15',
    participants: [], description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const { customUser, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    let hours = today.getHours();
    let minutes = Math.ceil(today.getMinutes() / 15) * 15;
    if (minutes === 60) { minutes = 0; hours += 1; }
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, date: formattedDate, time: formattedTime }));
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 1) return;
      try {
        const res = await axios.get(`/api/users/search?query=${searchQuery}`);
        setEmailSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch email suggestions:', err);
        setEmailSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformSelect = (platformId) => {
    setFormData(prev => ({ ...prev, platform: platformId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platform) return alert("❌ Please select a meeting platform.");
    if (!formData.title.trim()) return alert("❌ Please enter a meeting title.");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/meeting`, {
        user_id: customUser?.user_id,
        ...formData
      });
      const { meetingLink } = res.data;
      alert('✅ Meeting created!');
      window.open(meetingLink, '_blank');
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      alert('❌ Failed to create meeting');
    }
  };

  if (loading) return <div>Loading user...</div>;
  if (!customUser) return <div>Please log in to create a meeting.</div>;

  const platforms = [
    { id: 'zoom', name: 'Zoom', icon: 'zoom', description: 'Best for large meetings' },
    { id: 'webex', name: 'Webex', icon: 'webex', description: 'Cisco enterprise solution' },
    { id: 'microsoft teams', name: 'Microsoft Teams', icon: 'teams', description: 'Integrated with Office 365' },
    { id: 'google meet', name: 'Google Meet', icon: 'meet', description: 'Simple Google integration' }
  ];

  return (
    <div className="meeting-form-container">
      <div className="meeting-header">
        <h1 className="meeting-title">Schedule Your Meeting</h1>
        <p className="meeting-subtitle">Create and manage your meetings seamlessly</p>
        <div className="purple-underline"></div>
      </div>
      <div className="meeting-form-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><MessageCircle size={16} className="form-icon" /><span>Meeting Title</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter a descriptive title" className="form-input" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Calendar size={16} className="form-icon" /><span>Date</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label"><Clock size={16} className="form-icon" /><span>Time</span></label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label"><Clock size={16} className="form-icon" /><span>Duration</span></label>
              <select name="duration" value={formData.duration} onChange={handleInputChange} className="form-select">
                {[15,30,45,60,90,120].map(min => <option key={min} value={min}>{min} minutes</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><Video size={16} className="form-icon" /><span>Choose Meeting Platform</span></label>
            <div className="platform-grid">
              {platforms.map(platform => (
                <div key={platform.id} className={`platform-card ${formData.platform === platform.id ? 'selected' : ''}`} onClick={() => handlePlatformSelect(platform.id)}>
                  <div className={`platform-icon ${platform.icon}-icon`}></div>
                  <div className="platform-info">
                    <div className="platform-name">{platform.name}</div>
                    <div className="platform-description">{platform.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Repeat size={16} className="form-icon" /><span>Frequency</span></label>
              <select name="frequency" value={formData.frequency} onChange={handleInputChange} className="form-select">
                <option value="once">One-time Meeting</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><Bell size={16} className="form-icon" /><span>Reminder</span></label>
              <select name="reminderTime" value={formData.reminderTime} onChange={handleInputChange} className="form-select">
                {[15,30,60,120].map(m => <option key={m} value={m}>{m} minutes before</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><Users size={16} className="form-icon" /><span>Participants</span></label>
              <Autocomplete multiple freeSolo options={emailSuggestions} value={formData.participants} onChange={(e, newValue) => setFormData(prev => ({ ...prev, participants: newValue }))} renderInput={(params) => (<TextField {...params} placeholder="Email addresses (optional)" className="form-input" onChange={(e) => setSearchQuery(e.target.value)} />)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><Link size={16} className="form-icon" /><span>Description (Optional)</span></label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Add agenda, notes, or any additional information" className="form-textarea" rows="4"></textarea>
          </div>

          <button type="submit" className="create-meeting-btn"><span>Create Meeting</span><CheckCircle size={18} /></button>
        </form>

        <button className="view-meeting-list-btn" onClick={() => navigate('/meeting/list')}><List size={16} /><span>View Meeting List</span></button>
      </div>
    </div>
  );
};

export default MeetingPage;
