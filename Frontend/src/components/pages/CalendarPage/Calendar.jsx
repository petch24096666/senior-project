import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button, Modal, TextField, MenuItem, ToggleButtonGroup, ToggleButton } from "@mui/material";

const styles = {
  container: { display: "flex", gap: "20px", padding: "20px", background: "#f4f4f4", minHeight: "100vh" },
  leftPanel: { width: "30%", display: "flex", flexDirection: "column", gap: "16px" },
  calendarContainer: { background: "#fff", padding: "16px", borderRadius: "12px", boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.15)" },
  upcomingTasks: {
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
    background: "#fff",
    minHeight: "120px",
    maxHeight: "300px",
    overflowY: "auto",
    fontFamily: "'Roboto', sans-serif",
    fontSize: "14px",
    color: "#333",
    border: "1px solid #ddd",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderRadius: "8px",
    marginBottom: "8px",
    backgroundColor: "#f8f9fa",
    borderLeft: "5px solid", // ✅ ใช้สีของ Event
  },
  taskInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  colorIndicator: {
    width: "12px",
    height: "12px",
    borderRadius: "4px",
    display: "inline-block",
  },
  taskTitle: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  taskDetail: {
    fontSize: "12px",
    color: "#666",
  },
  taskTime: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#d9534f", // ✅ สีแดงสำหรับเวลาที่เหลือน้อย
  },
  mainContent: { flexGrow: 1, background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  modalContent: { background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", maxWidth: "400px", margin: "auto", marginTop: "10%" },
  textField: { marginBottom: "16px", width: "100%" },
};

const CalendarDashboard = () => {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", color: "#3788d8" });
  const [view, setView] = useState("timeGridDay"); // Default เป็น Today
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // วันที่เลือก
  const timelineRef = useRef(null);
  const calendarRef = useRef(null);

  // 📌 เมื่อคลิกที่ปฏิทินซ้าย, Timeline จะเปลี่ยนไปวันที่นั้น
  const handleDateClick = (info) => {
    console.log("Clicked Date:", info.dateStr);
    setSelectedDate(info.dateStr); // ✅ อัปเดตวันที่ที่เลือก
    if (timelineRef.current) {
      timelineRef.current.getApi().gotoDate(info.dateStr); // ✅ เปลี่ยนวันที่ของ Timeline
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start) {
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    setOpenModal(false);
  };

  const handleEventDrop = (info) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.start === info.oldEvent.startStr
          ? { ...event, start: info.event.startStr, end: info.event.endStr }
          : event
      )
    );
  };

  const handleSelect = (info) => {
    setNewEvent({
      title: "",
      start: info.startStr,
      end: info.endStr,
      color: "#3788d8",
    });
    setOpenModal(true);
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.calendarContainer}>
          <h2>Calendar</h2>
          <FullCalendar
            ref={calendarRef} // ✅ ผูก reference กับปฏิทินหลัก
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            selectable={true}
            dateClick={handleDateClick} // ✅ กดวันที่ -> เปลี่ยน Timeline
          />
        </div>
        <div style={styles.upcomingTasks}>
          <h2 style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>Upcoming Tasks</h2>

          {events.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {events
                .filter((event) => new Date(event.start).getTime() >= new Date().getTime())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .map((event, index) => {
                  const timeDiff = (new Date(event.start).getTime() - new Date().getTime()) / (1000 * 60); // ต่างกันกี่นาที
                  let timeLabel = "";
                  let timeColor = "#d9534f"; // Default แดง

                  if (timeDiff < 60) {
                    timeLabel = `${Math.ceil(timeDiff)} min`;
                  } else if (timeDiff < 1440) {
                    timeLabel = `${Math.ceil(timeDiff / 60)} hr`;
                    timeColor = "#f0ad4e"; // เหลือง
                  } else {
                    timeLabel = "Done";
                    timeColor = "#5cb85c"; // เขียว
                  }

                  return (
                    <li key={index} style={{ ...styles.taskItem, borderLeftColor: event.color }}>
                      <div style={styles.taskInfo}>
                        <span style={{ ...styles.colorIndicator, backgroundColor: event.color }}></span>
                        <div>
                          <div style={styles.taskTitle}>{event.title}</div>
                          <div style={styles.taskDetail}>Task details go here...</div>
                        </div>
                      </div>
                      <span style={{ ...styles.taskTime, color: timeColor }}>{timeLabel}</span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p style={{ color: "#888", fontStyle: "italic" }}>No upcoming tasks</p>
          )}
        </div>






      </div>

      {/* Right Panel - Timeline & Tasks */}
      <div style={styles.mainContent}>
        <ToggleButtonGroup value={view} exclusive onChange={(event, newView) => setView(newView || "timeGridDay")}>
          <ToggleButton value="timeGridDay">Day</ToggleButton>
          <ToggleButton value="timeGridWeek">Week</ToggleButton>
          <ToggleButton value="dayGridMonth">Month</ToggleButton>
        </ToggleButtonGroup>

        <FullCalendar
          ref={timelineRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView={view}
          editable={true} // ✅ เปิดใช้งานการลากและเปลี่ยนเวลาของ Booking
          eventDrop={handleEventDrop} // ✅ ฟังก์ชันอัปเดตเวลาหลังจากลาก
          selectable={true}
          select={handleSelect} // ✅ เลือกช่วงเวลาเพื่อ Booking
          events={events}
        />
      </div>

      {/* Modal for Creating Event */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div style={styles.modalContent}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Add Task / Meeting</h2>
          <TextField
            label="Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            style={styles.textField}
          />
          <TextField
            select
            label="Preset Colors"
            fullWidth
            value={newEvent.color}
            onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
            style={styles.textField}
          >
            <MenuItem value="#ff0000">🔴 Red</MenuItem>
            <MenuItem value="#ffcc00">🟡 Yellow</MenuItem>
            <MenuItem value="#00cc66">✅ Green</MenuItem>
            <MenuItem value="#3788d8">🔵 Blue</MenuItem>
            <MenuItem value="#800080">🟣 Purple</MenuItem>
            <MenuItem value="#ff6600">🟠 Orange</MenuItem>
          </TextField>
          <Button variant="contained" color="primary" fullWidth onClick={handleAddEvent}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarDashboard;
