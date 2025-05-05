import React, { useEffect } from 'react';
import Modal from './Modal';

const EventModal = ({
  showEventModal,
  onClose,
  eventForm,
  handleEventFormChange,
  handleEventSubmit,
  editingEvent,
  handleDeleteEvent,
  categories,
  setEventForm
}) => {
  if (!showEventModal) return null;
  const pad = (num) => num.toString().padStart(2, '0');

  // แปลงวันที่เป็นสตริงในรูปแบบที่ input[type="datetime-local"] ต้องการ (local time)
  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const eventpresetColors = [
    '#3366FF', // Blue
    '#33CC66', // Green
    '#FF6633', // Orange
    '#FF3366'  // Pink
  ];

  // เมื่อเปิด Modal และไม่ได้อยู่ในโหมดแก้ไข (create new event)
  useEffect(() => {
    if (showEventModal && !editingEvent) {
      const now = new Date();
      const startTime = new Date(now);
      startTime.setMinutes(0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      setEventForm({
        id: Date.now(), // ใช้ ID ชั่วคราว
        title: '',
        start: formatDateTimeForInput(startTime),
        end: formatDateTimeForInput(endTime),
        allDay: false,
        description: '',
        location: '',
        color: '#3366FF'
      });
    }
  }, [showEventModal, editingEvent, setEventForm]);

  return (
    <Modal onClose={onClose} className="event-modal">
      <div className="modal-header">
        <h2 className="modal-title">
          {editingEvent ? 'Edit Event' : 'Create Event'}
        </h2>
      </div>
      <form onSubmit={handleEventSubmit}>
        <div className="form-group">
          <label className="form-label">Event Title</label>
          <input
            type="text"
            name="title"
            value={eventForm.title}
            onChange={handleEventFormChange}
            required
            className="form-input"
            placeholder="Add title"
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">From</label>
            <input
              type="datetime-local"
              name="start"
              value={eventForm.start}
              onChange={handleEventFormChange}
              required
              className="form-input"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">To</label>
            <input
              type="datetime-local"
              name="end"
              value={eventForm.end}
              onChange={handleEventFormChange}
              required
              className="form-input"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              name="allDay"
              checked={eventForm.allDay}
              onChange={handleEventFormChange}
              className="form-checkbox"
            />
            <span className="form-checkbox-text">All day</span>
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">Location (optional)</label>
          <input
            type="text"
            name="location"
            value={eventForm.location}
            onChange={handleEventFormChange}
            className="form-input"
            placeholder="Add location"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <textarea
            name="description"
            value={eventForm.description}
            onChange={handleEventFormChange}
            className="form-textarea"
            placeholder="Add description"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-selector">
          {eventpresetColors.map(color => (
            <button
              key={color}
              type="button"
              className={`color-option ${eventForm.color === color ? 'selected' : ''}`}
              style={{
                backgroundColor: color,
                width: '24px',
                height: '24px',
                border: eventForm.color === color ? '2px solid #000' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setEventForm({ ...eventForm, color })}
            />
          ))}
          </div>
        </div>
        <div className="form-actions">
          {editingEvent && (
            <button type="button" className="delete-button" onClick={handleDeleteEvent}>
              Delete
            </button>
          )}
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {editingEvent ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EventModal;
