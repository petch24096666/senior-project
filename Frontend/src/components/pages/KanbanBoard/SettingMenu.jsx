import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
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

  return (
    <div ref={menuRef}>
      <Button
        variant="contained"
        size="small"
        startIcon={<SettingsIcon fontSize="small" />}
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8rem',
          backgroundColor: '#5e4cd7',
          color: 'white',
          '&:hover': {
            backgroundColor: '#4e3fc5',
          },
          borderRadius: '4px',
          padding: '6px 12px',
          boxShadow: 'none'
        }}
      >
        Settings
      </Button>
      <div
        className="settings-menu"
        style={{
          top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 5 : 0,
          left: anchorEl ? anchorEl.getBoundingClientRect().left : 0,
          display: open ? 'block' : 'none',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          width: '220px',
          zIndex: 1000,
          position: 'absolute',
          overflow: 'hidden'
        }}
      >
        <div 
          className="menu-header"
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 600,
            color: '#1a202c',
            fontSize: '0.95rem'
          }}
        >
          Settings
        </div>
        <div 
          className="menu-item" 
          onClick={handleRoleManagement}
          style={{
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: '#f7fafc',
            }
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div className="menu-icon" style={{ marginRight: '12px', color: '#5e4cd7' }}>
            <PersonIcon fontSize="small" />
          </div>
          <div className="menu-text" style={{ color: '#4a5568' }}>Role Management</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;