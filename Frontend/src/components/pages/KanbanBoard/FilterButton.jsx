import React, { useState, useEffect, useRef } from 'react';
import './KanbanBoard.css';

const FilterButton = ({ filters, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const menuRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setTempFilters({ ...filters });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onFilterChange(tempFilters);
    handleClose();
  };

  const handleReset = () => {
    const resetFilters = {
      priority: [],
      assignees: [],
      dueDate: 'all',
      status: []
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    handleClose();
  };

  // Handle click outside to close filter menu
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

  const handleFilterChange = (type, value) => {
    if (type === 'dueDate') {
      setTempFilters({ ...tempFilters, dueDate: value });
    } else {
      const newValues = [...tempFilters[type]];
      const index = newValues.indexOf(value);
      if (index === -1) {
        newValues.push(value);
      } else {
        newValues.splice(index, 1);
      }
      setTempFilters({ ...tempFilters, [type]: newValues });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priority.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.dueDate !== 'all') count++;
    if (filters.status.length > 0) count++;
    return count;
  };

  const open = Boolean(anchorEl);

  const icons = {
    filter: '🔢'
  };

  return (
    <div ref={menuRef}>
      <button className="filter-button" onClick={handleClick}>
        <span>{icons.filter}</span>
        <span>Filter</span>
        {getActiveFilterCount() > 0 && (
          <span className="filter-count-badge">
            {getActiveFilterCount()}
          </span>
        )}
      </button>
      <div
        className="filter-menu"
        style={{
          display: open ? 'block' : 'none',
          top: anchorEl ? anchorEl.getBoundingClientRect().bottom : 0,
          left: anchorEl ? anchorEl.getBoundingClientRect().left : 0,
        }}
      >
        <div className="filter-menu-header">
          <h3 className="filter-menu-title">Filters</h3>
        </div>
        <div className="filter-section">
          <h4 className="filter-section-title">Priority</h4>
          <div className="filter-options">
            {['high', 'medium', 'low'].map(priority => (
              <label key={priority} className="filter-option">
                <input
                  type="checkbox"
                  checked={tempFilters.priority.includes(priority)}
                  onChange={() => handleFilterChange('priority', priority)}
                />
                <span style={{ textTransform: 'capitalize' }}>{priority}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="filter-section">
          <h4 className="filter-section-title">Status</h4>
          <div className="filter-options">
            {[
              { value: 'todo', label: 'To Do' },
              { value: 'inprogress', label: 'In Progress' },
              { value: 'review', label: 'Review' },
              { value: 'done', label: 'Done' }
            ].map(status => (
              <label key={status.value} className="filter-option">
                <input
                  type="checkbox"
                  checked={tempFilters.status.includes(status.value)}
                  onChange={() => handleFilterChange('status', status.value)}
                />
                <span>{status.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="filter-section">
          <h4 className="filter-section-title">Due Date</h4>
          <div className="filter-options">
            {[
              { value: 'all', label: 'All' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'today', label: 'Due Today' },
              { value: 'week', label: 'Due This Week' },
              { value: 'future', label: 'Future' }
            ].map(option => (
              <label key={option.value} className="filter-option">
                <input
                  type="radio"
                  checked={tempFilters.dueDate === option.value}
                  onChange={() => handleFilterChange('dueDate', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="filter-actions">
          <button
            className="reset-button"
            onClick={handleReset}
          >
            Reset
          </button>
          <div className="filter-action-buttons">
            <button
              className="cancel-button"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="apply-button"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterButton;