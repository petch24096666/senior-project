import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MeetingPage.css';
import { UserContext } from '../../../context/Usercontext';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,

  Users,
  Bell,
  Repeat,
  CheckCircle,
  Link,
  List
} from 'lucide-react';

const MeetingPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    platform: '',
    frequency: 'once',
    reminderTime: '15',
    participants: [],
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 1) return;
      try {
        const res = await axios.get(`/api/users/search?query=${searchQuery}`);
        const emails = Array.isArray(res.data)
          ? res.data
          : []; // ✅ fallback ป้องกัน crash
        setEmailSuggestions(emails);
      } catch (err) {
        console.error('Failed to fetch email suggestions:', err);
        setEmailSuggestions([]); // ป้องกันไม่ให้เป็น undefined
      }
    };
  
    fetchSuggestions();
  }, [searchQuery]);  

  const { customUser, loading } = useContext(UserContext);

  // Set default date and time on component mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Format time as HH:MM
    let hours = today.getHours();
    let minutes = today.getMinutes();
    // Round to nearest 15 min
    minutes = Math.ceil(minutes / 15) * 15;
    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }
    
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
      time: formattedTime
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlatformSelect = (platformId) => {
    setFormData({
      ...formData,
      platform: platformId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform) {
      alert("❌ Please select a meeting platform.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:8081/api/meeting', {
        user_id: customUser.user_id, // ✅ เพิ่มตรงนี้
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        platform: formData.platform,
        frequency: formData.frequency,
        reminderTime: formData.reminderTime,
        participants: formData.participants, // 👈 แยก email เป็น array
        description: formData.description
      });
  
      const { meetingLink } = res.data;
      alert('✅ Meeting created!');
      window.open(meetingLink, '_blank');
    } catch (error) {
      console.error(error);
      alert('❌ Failed to create meeting');
    }
  };
  
  
  const handleViewMeetingList = () => {
    navigate('/meeting/list');
  };

  const navigate = useNavigate();

  // Platform options
  const platforms = [
    { 
      id: 'zoom', 
      name: 'Zoom',
      icon: 'zoom',
      description: 'Best for large meetings' 
    },
    { 
      id: 'webex', 
      name: 'Webex',
      icon: 'webex',
      description: 'Cisco enterprise solution' 
    },
    { 
      id: 'teams', 
      name: 'Microsoft Teams',
      icon: 'teams',
      description: 'Integrated with Office 365' 
    },
    { 
      id: 'meet', 
      name: 'Google Meet',
      icon: 'meet',
      description: 'Simple Google integration' 
    }
  ];

  if (loading) return <div>Loading user...</div>;
  if (!customUser) return <div>Please log in to create a meeting.</div>;

  return (
    <div className="meeting-form-container">
      <div className="meeting-header">
        <h1 className="meeting-title">Schedule Your Meeting</h1>
        <p className="meeting-subtitle">Create and manage your meetings seamlessly</p>
        <div className="purple-underline"></div>
      </div>

      <div className="meeting-form-wrapper">
        <form onSubmit={handleSubmit}>
          {/* Meeting Title */}
          <div className="form-group">
            <label className="form-label">
              <MessageCircle size={16} className="form-icon" />
              <span>Meeting Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title"
              className="form-input"
            />
          </div>

          {/* Date, Time, Duration Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} className="form-icon" />
                <span>Date</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} className="form-icon" />
                <span>Time</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Clock size={16} className="form-icon" />
                <span>Duration</span>
              </label>
              <div className="select-wrapper">
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="form-group">
            <label className="form-label">
              <Video size={16} className="form-icon" />
              <span>Choose Meeting Platform</span>
            </label>
            <div className="platform-grid">
              {platforms.map(platform => (
                <div
                  key={platform.id}
                  className={`platform-card ${formData.platform === platform.id ? 'selected' : ''}`}
                  onClick={() => handlePlatformSelect(platform.id)}
                >
                  <div className={`platform-icon ${platform.icon}-icon`}></div>
                  <div className="platform-info">
                    <div className="platform-name">{platform.name}</div>
                    <div className="platform-description">{platform.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency, Reminder, Participants Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Repeat size={16} className="form-icon" />
                <span>Frequency</span>
              </label>
              <div className="select-wrapper">
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="once">One-time Meeting</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Bell size={16} className="form-icon" />
                <span>Reminder</span>
              </label>
              <div className="select-wrapper">
                <select
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Users size={16} className="form-icon" />
                <span>Participants</span>
              </label>

              <Autocomplete
                multiple
                freeSolo
                options={emailSuggestions}
                value={formData.participants}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, participants: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Email addresses (optional)"
                    className="form-input"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <Link size={16} className="form-icon" />
              <span>Description (Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add agenda, notes, or any additional information"
              className="form-textarea"
              rows="4"
            ></textarea>
          </div>

          {/* Create Meeting Button */}
          <button type="submit" className="create-meeting-btn">
            <span>Create Meeting</span>
            <CheckCircle size={18} />
          </button>
        </form>

        {/* View Meeting List Button */}
        <button 
          className="view-meeting-list-btn"
          onClick={handleViewMeetingList}
        >
          <List size={16} />
          <span>View Meeting List</span>
        </button>
      </div>
    </div>
  );
};

export default MeetingPage;