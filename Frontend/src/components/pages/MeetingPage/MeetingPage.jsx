import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './MeetingPage.css';
import { 
  Calendar, 
  Clock, 
  Video, 
  Link2, 
  Check, 
  ChevronDown, 
  MessageCircle,
  AlertCircle,
  Users,
  Bell,
  Repeat,
  Loader
} from 'lucide-react';

// Configuration Constants
const MEETING_CONFIGURATIONS = {
  platforms: [
    { 
      id: 'zoom', 
      name: 'Zoom', 
      icon: '🖥️', 
      description: 'Best for large meetings' 
    },
    { 
      id: 'webex', 
      name: 'Webex', 
      icon: '🌐', 
      description: 'Cisco enterprise solution' 
    },
    { 
      id: 'teams', 
      name: 'Microsoft Teams', 
      icon: '👥', 
      description: 'Integrated with Office 365' 
    },
    { 
      id: 'meet', 
      name: 'Google Meet', 
      icon: '🎥', 
      description: 'Simple Google integration' 
    }
  ],
  frequencies: [
    { value: 'once', label: 'One-time Meeting' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ],
  reminders: [
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hours before' }
  ],
  durations: [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ]
};

// Main Meeting Scheduler Component
const MeetingScheduler = () => {
  // State Management
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    platform: '',
    frequency: 'once',
    reminderTime: '15',
    description: '',
    participants: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Set default date to today
  useEffect(() => {
    const meetingDefaultday = new Date();
    const meetingDefaultTime = new Date();
    const formattedDate = meetingDefaultday.toISOString().split('T')[0];
    const formattedTime = meetingDefaultTime.toTimeString().slice(0, 5);   // HH:mm
    setMeetingDetails(prev => ({
      ...prev,
      date: formattedDate,
      time: formattedTime
    }));
  }, []);

  // Validation Logic
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!meetingDetails.title.trim()) {
      errors.title = 'Meeting title is required';
    }
    
    if (!meetingDetails.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(meetingDetails.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }
    
    if (!meetingDetails.time) {
      errors.time = 'Time is required';
    }
    
    if (!meetingDetails.platform) {
      errors.platform = 'Please select a meeting platform';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [meetingDetails]);

  // Event Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setMeetingDetails(prev => ({
      ...prev,
      [name]: value
    }));
    setFormTouched(true);
  }, []);

  const handlePlatformSelect = useCallback((platformId) => {
    setMeetingDetails(prev => ({
      ...prev,
      platform: platformId
    }));
    setFormTouched(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call or processing
      setTimeout(() => {
        console.log('Meeting submitted:', meetingDetails);
        setIsSubmitting(false);
        
        // Show success message (in a real app, you would use a toast notification)
        alert('Meeting successfully scheduled!');
        
        // Reset form
        setMeetingDetails({
          title: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          duration: '60',
          platform: '',
          frequency: 'once',
          reminderTime: '15',
          description: '',
          participants: ''
        });
        setFormTouched(false);
      }, 1500);
    }
  }, [validateForm, meetingDetails]);

  // Form validation on touched fields
  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [meetingDetails, formTouched, validateForm]);

  // Memoized Rendering Helpers
  const PlatformOptions = useMemo(() => 
    MEETING_CONFIGURATIONS.platforms.map((platform) => (
      <div 
        key={platform.id}
        className={`platform-card ${
          meetingDetails.platform === platform.id ? 'selected' : ''
        }`}
        onClick={() => handlePlatformSelect(platform.id)}
      >
        <div className="platform-icon">{platform.icon}</div>
        <div className="platform-details">
          <span className="platform-name">{platform.name}</span>
          <span className="platform-description">
            {platform.description}
          </span>
        </div>
      </div>
    )), 
    [meetingDetails.platform, handlePlatformSelect]
  );

  // Format meeting duration for display
  const formattedDuration = useMemo(() => {
    const duration = MEETING_CONFIGURATIONS.durations.find(
      d => d.value === meetingDetails.duration
    );
    return duration ? duration.label : '';
  }, [meetingDetails.duration]);

  return (
    <div className="meeting-scheduler-container">
      <form onSubmit={handleSubmit} className="meeting-form">
        <div className="form-header">
          <h1>Schedule Your Meeting</h1>
          <p>Create and manage your meetings seamlessly</p>
        </div>

        {/* Meeting Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            <MessageCircle size={16} /> Meeting Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={meetingDetails.title}
            onChange={handleInputChange}
            placeholder="Enter a descriptive title"
            className={`form-input ${validationErrors.title ? 'error' : ''}`}
          />
          {validationErrors.title && (
            <span className="error-message">
              <AlertCircle size={12} /> {validationErrors.title}
            </span>
          )}
        </div>

        {/* Date, Time, Duration Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              <Calendar size={16} className="date-time-icon" /> Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              value={meetingDetails.date}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.date ? 'error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {validationErrors.date && (
              <span className="error-message">
                <AlertCircle size={12} /> {validationErrors.date}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="time" className="form-label">
              <Clock size={16} className="date-time-icon" /> Time
            </label>
            <input
              id="time"
              type="time"
              name="time"
              value={meetingDetails.time}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.time ? 'error' : ''}`}
            />
            {validationErrors.time && (
              <span className="error-message">
                <AlertCircle size={12} /> {validationErrors.time}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="duration" className="form-label">
              <Clock size={16} className="date-time-icon" /> Duration
            </label>
            <select
              id="duration"
              name="duration"
              value={meetingDetails.duration}
              onChange={handleInputChange}
              className="form-input"
            >
              {MEETING_CONFIGURATIONS.durations.map(duration => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="form-group platform-selection">
          <label className="form-label">
            <Video size={16} /> Choose Meeting Platform
          </label>
          <div className="platform-grid">
            {PlatformOptions}
          </div>
          {validationErrors.platform && (
            <span className="error-message">
              <AlertCircle size={12} /> {validationErrors.platform}
            </span>
          )}
        </div>

        <div className="section-divider"></div>

        {/* Additional Options */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="frequency" className="form-label">
              <Repeat size={16} /> Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={meetingDetails.frequency}
              onChange={handleInputChange}
              className="form-input"
            >
              {MEETING_CONFIGURATIONS.frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminderTime" className="form-label">
              <Bell size={16} /> Reminder
            </label>
            <select
              id="reminderTime"
              name="reminderTime"
              value={meetingDetails.reminderTime}
              onChange={handleInputChange}
              className="form-input"
            >
              {MEETING_CONFIGURATIONS.reminders.map(reminder => (
                <option key={reminder.value} value={reminder.value}>
                  {reminder.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="participants" className="form-label">
              <Users size={16} /> Participants
            </label>
            <input
              id="participants"
              type="text"
              name="participants"
              value={meetingDetails.participants}
              onChange={handleInputChange}
              placeholder="Email addresses (optional)"
              className="form-input"
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            <Link2 size={16} /> Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={meetingDetails.description}
            onChange={handleInputChange}
            placeholder="Add agenda, notes, or any additional information"
            className="form-input textarea"
            rows="3"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="loading-spinner" />
              Creating Meeting...
            </>
          ) : (
            <>
              Create Meeting
              <Check size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MeetingScheduler;