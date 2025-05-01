import React, { useState, useEffect }  from 'react';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // อัปเดตเวลาปัจจุบันทุกๆ 1 นาที
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 * 1000 ms = 1 นาที

    // Cleanup เมื่อ component ถูก unmount
    return () => clearInterval(timerId);
  }, []);

  // ฟังก์ชันคำนวณตำแหน่งของเส้นบอกเวลา
  const calculateIndicatorPosition = () => {
    const now = currentTime;
    const today = new Date();

    // ตรวจสอบว่าวันที่แสดงใน View เป็นวันปัจจุบันหรือไม่
    if (
      currentDate.getDate() !== today.getDate() ||
      currentDate.getMonth() !== today.getMonth() ||
      currentDate.getFullYear() !== today.getFullYear()
    ) {
      return null; // ไม่แสดงเส้นถ้าไม่ใช่วันนี้
    }

    const totalMinutesPastMidnight = now.getHours() * 60 + now.getMinutes();
    // *** สมมติว่า 1 ชั่วโมงในตารางสูง 60px ***
    // *** ถ้าความสูงจริงไม่เท่านี้ ต้องปรับตัวเลข 60 ด้านล่าง ***
    const hourSlotHeight = 60;
    const pixelsPerMinute = hourSlotHeight / 60; // จำนวน pixel ต่อนาที
    const topOffset = totalMinutesPastMidnight * pixelsPerMinute;

    // ให้แน่ใจว่าเส้นไม่เกินขอบเขตของ 24 ชั่วโมง (เผื่อกรณีคำนวณผิดพลาดเล็กน้อย)
    return Math.min(topOffset, 24 * hourSlotHeight - 2); // -2 เพื่อให้เส้นไม่ตกขอบล่างสุด
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
                setShowEventModal(true);
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
            style={{ top: `${indicatorTop}px` }}
            aria-hidden="true" // เพิ่ม accessibility
          >
            <div className="current-time-indicator-dot"></div>
          </div>
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
                setShowEventModal(true);
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
