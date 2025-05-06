import React, { useState, useEffect }  from 'react';
import {
  PIXELS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOUR_SLOT_HEIGHT
} from '../../../utils/timeGridController';

const DayView = ({
  currentDate,
  timeSlots,
  getTimeLabel,
  getAllDayEvents,
  getEventsForHour,
  setSelectedDate,
  setEditingEvent,
  formatDate,
  onSlotClick,
}) => {
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);
  
  // ฟังก์ชันคำนวณตำแหน่ง indicator โดยใช้คอนสแตนต์เดียวกับ event layout
  const calculateIndicatorPosition = () => {
    const now   = currentTime;
    const today = new Date();
  
    // ถ้าไม่ใช่วันเดียวกับ currentDate ก็ไม่ต้องแสดง
    if (
      currentDate.getDate() !== today.getDate() ||
      currentDate.getMonth() !== today.getMonth() ||
      currentDate.getFullYear() !== today.getFullYear()
    ) {
      return null;
    }
  
    const totalMinutesPastMidnight =
      now.getHours() * MINUTES_PER_HOUR + now.getMinutes();
  
    const topOffset = totalMinutesPastMidnight * PIXELS_PER_MINUTE;
  
    // ไม่ให้เลยขอบล่าง (24 ชั่วโมง)
    const maxOffset = HOUR_SLOT_HEIGHT * 24 - 2;
    return Math.min(topOffset, maxOffset);
  };
  
  const indicatorTop = calculateIndicatorPosition();

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
                onSlotClick(new Date(currentDate));
              }}
            ></div>
          )}
        </div>
      </div>
      {/* --- แก้ไขส่วนนี้ --- */}
      {/* เพิ่ม style={{ position: 'relative' }} ให้กับ container */}
      <div className="time-slots-container" style={{ position: 'relative' }}>
          
        {/* --- เพิ่ม Element เส้นบอกเวลา --- */}
        {indicatorTop !== null && (
            <div
              className="current-time-indicator"
              style={{
                position: 'absolute',
                top: `${indicatorTop}px`,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'red',
                zIndex: 2
              }}
            />
          )}
        {/* --- สิ้นสุด Element เส้นบอกเวลา --- */}


        {/* Render time slots เหมือนเดิม */}
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
                onSlotClick(new Date(currentDate));
              }}
            >
              {getEventsForHour(currentDate, hour).map(event => (
                <div
                  key={event.id} // ใช้ event.id (ซึ่งตอนนี้คือ event_id)
                  className="time-slot-event"
                  style={{ backgroundColor: event.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // ส่ง event object ที่มี id (event_id) กลับไปให้ ModernCalendar
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
