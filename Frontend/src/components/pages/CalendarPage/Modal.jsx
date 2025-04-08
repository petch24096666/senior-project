import React from 'react';
import './ModernCalendar.css';

const Modal = ({ children, onClose, className = '' }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-container ${className}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
