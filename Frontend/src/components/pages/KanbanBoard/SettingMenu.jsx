import React, { useState, useEffect, useRef } from 'react';
import './KanbanBoard.css';

const SettingsMenu = ({ onOpenRoleManagement }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleManagement = () => {
    onOpenRoleManagement();
    handleClose();
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAnchorEl(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const open = Boolean(anchorEl);

  const icons = {
    settings: '⚙️',
    role: '👤'
  };

  return (
    <div ref={menuRef}>
      <button className="filter-button" onClick={handleClick}>
        <span>{icons.settings}</span>
        <span>Settings</span>
      </button>
      <div
        className="settings-menu"
        style={{
          top: anchorEl ? anchorEl.getBoundingClientRect().bottom : 0,
          left: anchorEl ? anchorEl.getBoundingClientRect().left : 0,
          display: open ? 'block' : 'none'
        }}
      >
        <div className="menu-header">Settings</div>
        <div className="menu-item" onClick={handleRoleManagement}>
          <div className="menu-icon">{icons.role}</div>
          <div className="menu-text">Role Management</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;