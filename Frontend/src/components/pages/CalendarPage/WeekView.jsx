import React from 'react';

const WeekView = ({
  timeSlots,
  getTimeLabel,
  getDaysInWeek,
  isToday,
  getAllDayEvents,
  getEventsForHour,
  setSelectedDate,
  setShowEventModal,
  setEditingEvent,
  onSlotClick 
}) => {
  const daysInWeek = getDaysInWeek();
  const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="week-view">
      <div className="week-header">
        <div style={{ padding: '12px', borderRight: '1px solid #E5E7EB' }}></div>
        {daysInWeek.map((day, index) => (
          <div
            key={index}
            className={`week-header-cell ${isToday(day) ? 'today' : ''}`}
            style={{ borderRight: index < 6 ? '1px solid #E5E7EB' : 'none' }}
          >
            <div className="week-day-name">{daysOfWeekShort[index]}</div>
            <div className={`week-day-number ${isToday(day) ? 'today' : ''}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      <div className="week-all-day-row">
        <div className="time-label">All day</div>
        {daysInWeek.map((day, index) => {
          const dayEvents = getAllDayEvents(day);
          return (
            <div
              key={index}
              className="week-all-day-cell"
              style={{ borderRight: index < 6 ? '1px solid #E5E7EB' : 'none' }}
              onClick={() => {
                  setSelectedDate(day);
                  setEditingEvent(null);
                  onSlotClick(day);       // ← เรียก create handler
                }}
            >
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="week-all-day-event"
                  style={{ backgroundColor: event.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEvent(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="week-time-grid">
        {timeSlots.map(hour => (
          <div key={hour} className="week-time-row">
            <div className="time-label">{getTimeLabel(hour)}</div>
            {daysInWeek.map((day, index) => {
              const hourEvents = getEventsForHour(day, hour);
              return (
                <div
                  key={index}
                  className="week-time-cell"
                  style={{ borderRight: index < 6 ? '1px solid #E5E7EB' : 'none' }}
                  onClick={() => {
                    const date = new Date(day);
                    date.setHours(hour, 0, 0, 0);
                    setSelectedDate(date);
                    setEditingEvent(null);
                    onSlotClick(date);     // ← เรียก create handler
                    }}
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className="week-time-event"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
