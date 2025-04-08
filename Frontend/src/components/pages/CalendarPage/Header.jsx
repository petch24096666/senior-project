import React from 'react';

const Header = ({ 
  viewMode, 
  setViewMode, 
  currentDate, 
  goToToday, 
  goToPrevious, 
  goToNext, 
  formatDate, 
  getDaysInWeek, 
  setShowEventModal 
}) => {
  return (
    <div className="calendar-header">
      <div className="calendar-title-container">
        <h1 className="calendar-title">Calendar</h1>
        <div className="view-toggle-container">
          <button 
            className={`view-toggle-button ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={`view-toggle-button ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`view-toggle-button ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="calendar-controls">
        <button className="today-button" onClick={goToToday}>Today</button>
        <div className="nav-buttons-container">
          <button className="nav-button" onClick={goToPrevious}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="nav-button" onClick={goToNext}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <h2 className="current-date-display">
          {viewMode === 'month' 
           ? formatDate(currentDate, 'monthYear') 
           : viewMode === 'week'
           ? `${formatDate(getDaysInWeek()[0], 'full')} - ${formatDate(getDaysInWeek()[6], 'full')}`
           : formatDate(currentDate, 'full')}
        </h2>
        <button className="create-event-button" onClick={() => setShowEventModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Create
        </button>
      </div>
    </div>
  );
};

export default Header;
