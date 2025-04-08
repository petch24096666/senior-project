import React from 'react';

const MonthView = ({
  currentDate,
  getDaysInMonth,
  handleDateClick,
  isToday,
  formatDate,
  getEventsForDate
}) => {
  const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="month-view">
      <div className="month-header">
        {daysOfWeekShort.map((day, index) => (
          <div key={index} className="month-header-day">
            {day}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {getDaysInMonth().map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          return (
            <div
              key={index}
              className={`month-day ${isToday(day.date) ? 'today' : ''} ${!day.currentMonth ? 'other-month' : ''}`}
              onClick={() => handleDateClick(day.date)}
            >
              <div className="month-day-number-container">
                <div className={`month-day-number ${isToday(day.date) ? 'today' : ''}`}>
                  {day.date.getDate()}
                </div>
              </div>
              <div className="month-events-container">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="month-event"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="month-more-events">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
