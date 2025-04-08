import React from 'react';

const DayView = ({
  currentDate,
  timeSlots,
  getTimeLabel,
  getAllDayEvents,
  getEventsForHour,
  setSelectedDate,
  setShowEventModal,
  setEditingEvent,
  formatDate
}) => {
  return (
    <div className="day-view">
      <div className="all-day-section">
        <div className="time-label">All day</div>
        <div className="all-day-events">
          {getAllDayEvents(currentDate).map(event => (
            <div
              key={event.id}
              className="all-day-event"
              style={{ backgroundColor: event.color }}
              onClick={() => setEditingEvent(event)}
            >
              {event.title}
            </div>
          ))}
          {getAllDayEvents(currentDate).length === 0 && (
            <div
              className="empty-all-day-slot"
              onClick={() => {
                setSelectedDate(new Date(currentDate));
                setEditingEvent(null);
                setShowEventModal(true);
              }}
            ></div>
          )}
        </div>
      </div>
      <div className="time-slots-container">
        {timeSlots.map(hour => (
          <div key={hour} className="time-slot">
            <div className="time-label">{getTimeLabel(hour)}</div>
            <div
              className="time-slot-content"
              onClick={() => {
                const date = new Date(currentDate);
                date.setHours(hour, 0, 0, 0);
                setSelectedDate(date);
                setEditingEvent(null);
                setShowEventModal(true);
              }}
            >
              {getEventsForHour(currentDate, hour).map(event => (
                <div
                  key={event.id}
                  className="time-slot-event"
                  style={{ backgroundColor: event.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEvent(event);
                  }}
                >
                  <div>{event.title}</div>
                  <div className="time-slot-event-time">
                    {formatDate(event.start, 'time')} - {formatDate(event.end, 'time')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;
