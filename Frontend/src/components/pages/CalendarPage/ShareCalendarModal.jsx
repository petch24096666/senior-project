import React, { useState } from 'react';
import Modal from './Modal';

const ShareCalendarModal = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // ส่ง email ไปยัง backend สำหรับการแชร์ปฏิทิน
    onSubmit(email);
    setEmail('');
  };

  return (
    <Modal onClose={onClose} className="share-calendar-modal">
      <div className="modal-header">
        <h2 className="modal-title">Share Calendar</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Share
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ShareCalendarModal;
