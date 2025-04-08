import React from 'react';
import ShareCalendarButton from './ShareCalendarButton';

const Sidebar = ({
  categories,
  events,
  setEditingCategory,
  setCategoryForm,
  setShowCategoryModal,
  setEditingEvent,
  formatDate
}) => {
  const upcomingEvents = events
    .filter(event => event.start >= new Date())
    .sort((a, b) => a.start - b.start)
    .slice(0, 3);

  return (
    <div className="calendar-sidebar">
      {/* ปุ่ม Share Calendar */}
      <div style={{ marginBottom: '20px' }}>
        <ShareCalendarButton />
      </div>
      
      <div>
        <div className="sidebar-section-header">
          <h3 className="sidebar-section-title">Categories</h3>
          <button
            className="add-category-button"
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ id: '', name: '', color: '#3366FF' });
              setShowCategoryModal(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '14px', height: '14px' }}>
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Category
          </button>
        </div>
        <div className="categories-list">
          {categories.map(category => (
            <div key={category.id} className="category-item">
              <span 
                className="category-color"
                style={{ backgroundColor: category.color }}
              ></span>
              <span className="category-name">{category.name}</span>
              <button
                className="category-edit-button"
                onClick={() => {
                  setEditingCategory(category);
                  setCategoryForm({ id: category.id, name: category.name, color: category.color });
                  setShowCategoryModal(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="sidebar-section-title" style={{ marginBottom: '8px' }}>Upcoming Events</h3>
        <div className="upcoming-events-list">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div
                key={event.id}
                className="upcoming-event-item"
                style={{ borderLeftColor: event.color }}
                onClick={() => setEditingEvent(event)}
              >
                <div className="upcoming-event-title">{event.title}</div>
                <div className="upcoming-event-date">{formatDate(event.start, 'full')}</div>
              </div>
            ))
          ) : (
            <div className="no-events-message">No upcoming events</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
