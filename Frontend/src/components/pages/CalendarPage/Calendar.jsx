import React, { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../../../utils/supabaseClient";
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", color: "#3788d8" });
  const [view, setView] = useState("timeGridDay"); // Default เป็น Today
  const timelineRef = useRef(null);
  const calendarRef = useRef(null);
  const [googleToken, setGoogleToken] = useState(localStorage.getItem("googleToken") || null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [microsoftToken, setMicrosoftToken] = useState(localStorage.getItem("microsoftToken") || null);

  const fetchEvents = async () => {
    const provider = localStorage.getItem("authProvider");
    console.log("Fetch Provider:", provider);
    
    if (provider === "google") {
      const googleToken = localStorage.getItem("googleToken");
      if (!googleToken) {
        console.warn("❌ No Google token found.");
        return;
      }
  
      const response = await fetch("http://localhost:8081/api/google-events", {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Received Google events data:", data);
  
        if (data.items && Array.isArray(data.items)) {
          console.log("Google events items:", data.items);
  
          const events = data.items.map(item => ({
            id: item.id,
            title: item.summary,
            start: new Date(item.start.dateTime || item.start.date),
            end: new Date(item.end.dateTime || item.end.date),
            color: "#4285F4",
          }));
  
          setEvents(events);
        } else {
          console.error("❌ Google events data.items is not an array or is empty");
        }
      } else {
        console.error("❌ Error fetching Google events:", response.status);
      }
    } else if (provider === "microsoft") {
      const microsoftToken = localStorage.getItem("microsoftToken");
      if (!microsoftToken) {
        console.warn("❌ No Microsoft token found.");
        return;
      }
    
      const response = await fetch("http://localhost:8081/api/microsoft-events", {
        headers: { Authorization: `Bearer ${microsoftToken}` },
      });
    
      if (response.ok) {
        const data = await response.json();
        console.log("Microsoft events raw:", data);
    
        if (data.value && Array.isArray(data.value)) {
          const events = data.value.map(item => {
            // Fix: Parse Microsoft dates correctly with proper timezone handling
            // Microsoft returns UTC dates, so we need to convert them to local time
            const startDateTime = new Date(item.start.dateTime + 'Z'); // Add 'Z' to specify UTC
            const endDateTime = new Date(item.end.dateTime + 'Z');
            
            return {
              id: item.id,
              title: item.subject,
              start: startDateTime,
              end: endDateTime,
              color: "#0078D4",
            };
          });
    
          setEvents(events);
        } else {
          console.error("❌ Microsoft events data.value is not an array or is empty");
        }
      } else {
        console.error("❌ Error fetching Microsoft events:", response.status);
      }
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);

  // 📌 เมื่อคลิกที่ปฏิทินซ้าย, Timeline จะเปลี่ยนไปวันที่นั้น
  const handleDateClick = (info) => {
    console.log("Clicked Date:", info.dateStr);
    setSelectedDate(info.dateStr); // ✅ อัปเดตวันที่ที่เลือก
    if (timelineRef.current) {
      timelineRef.current.getApi().gotoDate(info.dateStr); // ✅ เปลี่ยนวันที่ของ Timeline
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      color: event.backgroundColor || "#4285F4",
    });
    setDetailModalOpen(true); // ➕ ใช้ modal สำหรับดูรายละเอียด
  };

  const handleAddEvent = async () => {
  if (!newEvent.title || !newEvent.start) {
    alert("Please enter event details.");
    return;
  }

  const provider = localStorage.getItem("authProvider");
  const token = localStorage.getItem(
    provider === "google" ? "googleToken" : "microsoftToken"
  );

  if (!provider || !token) {
    console.error("❌ Missing authProvider or token");
    return;
  }
  // ✅ ดึง timezone จากเครื่องผู้ใช้อัตโนมัติ
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 🕐 แปลงเป็น ISO format ด้วย timezone Asia/Bangkok
  const start = DateTime.fromISO(newEvent.start).setZone("Asia/Bangkok").toISO();
  const end = newEvent.end
    ? DateTime.fromISO(newEvent.end).setZone("Asia/Bangkok").toISO()
    : start;

  const eventDetails = {
    title: newEvent.title,
    start,
    end,
    timeZone: userTimeZone, // ✅ ใส่ timezone ที่ดึงมา
  };

  let addedEvent = null;

  if (provider === "google") {
    addedEvent = await addEventToGoogleCalendar(eventDetails, token);
  } else if (provider === "microsoft") {
    addedEvent = await addEventToMicrosoftCalendar(eventDetails, token);
  }

  if (addedEvent) {
    setEvents((prevEvents) => [
      ...prevEvents,
      {
        id: addedEvent.id,
        title: addedEvent.summary || addedEvent.subject,
        start: addedEvent.start.dateTime || addedEvent.start,
        end: addedEvent.end.dateTime || addedEvent.end,
        color: provider === "google" ? "#4285F4" : "#0078D4",
      },
    ]);
  }

  setOpenModal(false);
};
  
  // ✅ Add Event to Google Calendar
  const addEventToGoogleCalendar = async (event, token) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: event.title,
            start: {
              dateTime: event.start,
              timeZone: "Asia/Bangkok",
            },
            end: {
              dateTime: event.end,
              timeZone: "Asia/Bangkok",
            },
            description: "Created from my app",
          }),
        }
      );
  
      if (!response.ok) throw new Error(`Google error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("❌ Error adding to Google Calendar:", err);
      return null;
    }
  };
  
  // ✅ Add Event to Microsoft Calendar
  const addEventToMicrosoftCalendar = async (event, token) => {
    try {
      const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: event.title,
          start: {
            dateTime: event.start,
            timeZone: event.timeZone, // ✅ เปลี่ยนจาก fix เป็น dynamic
          },
          end: {
            dateTime: event.end,
            timeZone: event.timeZone,
          },
          body: {
            contentType: "HTML",
            content: "Created from my app",
          },
        }),
      });
  
      if (!res.ok) throw new Error(`Microsoft error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("❌ Error adding to Microsoft Calendar:", err);
      return null;
    }
  };
  

  const handleEventDrop = async (info) => {
    const provider = localStorage.getItem("authProvider");
  
    const eventId = info.event.id;
    const newStart = info.event.start.toISOString();
    const newEnd = info.event.end ? info.event.end.toISOString() : newStart;
  
    if (!eventId) {
      console.error("❌ Missing eventId");
      return;
    }
  
    if (provider === "google") {
      const googleToken = localStorage.getItem("googleToken");
      if (!googleToken) {
        console.error("❌ No Google Token");
        return;
      }
  
      const updatedEvent = {
        summary: info.event.title,
        start: {
          dateTime: newStart,
          timeZone: "Asia/Bangkok",
        },
        end: {
          dateTime: newEnd,
          timeZone: "Asia/Bangkok",
        },
      };
  
      try {
        const response = await fetch(`http://localhost:8081/api/update-google-event/${eventId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${googleToken}`,
          },
          body: JSON.stringify({ updatedEvent }),
        });
  
        if (!response.ok) throw new Error(`Google update failed: ${response.status}`);
        const data = await response.json();
  
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, start: data.start.dateTime, end: data.end.dateTime } : event
          )
        );
  
        console.log("✅ Google event updated");
      } catch (err) {
        console.error("❌ Error updating Google event:", err);
      }
  
    } else if (provider === "microsoft") {
      const msToken = localStorage.getItem("microsoftToken");
      if (!msToken) {
        console.error("❌ No Microsoft Token");
        return;
      }
  
      const updatedEvent = {
        subject: info.event.title,
        start: {
          dateTime: newStart,
          timeZone: "Asia/Bangkok",
        },
        end: {
          dateTime: newEnd,
          timeZone: "Asia/Bangkok",
        },
      };
  
      try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${msToken}`,
          },
          body: JSON.stringify(updatedEvent),
        });
  
        if (!response.ok) throw new Error(`Microsoft update failed: ${response.status}`);
  
        // ไม่มีการตอบกลับเป็น body จาก PATCH Microsoft (204 No Content)
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, start: newStart, end: newEnd } : event
          )
        );
  
        console.log("✅ Microsoft event updated");
      } catch (err) {
        console.error("❌ Error updating Microsoft event:", err);
      }
  
    } else {
      console.warn("⚠️ Unsupported provider:", provider);
    }
  };
  

  const handleConfirmDelete = async () => {
    const provider = localStorage.getItem("authProvider");
    const eventId = selectedEvent?.id;
  
    if (!eventId) {
      console.warn("❌ No selected event to delete.");
      return;
    }
  
    try {
      if (provider === "google") {
        let googleToken = localStorage.getItem("googleToken");
        if (!googleToken) {
          console.warn("⚠️ No Google Token found, fetching new one...");
          googleToken = await getGoogleAccessToken();
          if (!googleToken) {
            console.error("❌ Unable to obtain new Google Token!");
            return;
          }
        }
  
        console.log("🗑️ Deleting Google Event ID:", eventId);
  
        const response = await fetch(`http://localhost:8081/api/delete-google-event/${eventId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
        });
  
        if (!response.ok) throw new Error(`Google Calendar API error: ${response.status}`);
  
        console.log("✅ Google event deleted.");
  
      } else if (provider === "microsoft") {
        const microsoftToken = localStorage.getItem("microsoftToken");
        if (!microsoftToken) {
          console.error("❌ No Microsoft token.");
          return;
        }
  
        console.log("🗑️ Deleting Microsoft Event ID:", eventId);
  
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${microsoftToken}`,
          },
        });
  
        if (!response.ok) throw new Error(`Microsoft API error: ${response.status}`);
  
        console.log("✅ Microsoft event deleted.");
      } else {
        console.warn("⚠️ Unsupported provider:", provider);
        return;
      }
  
      // ✅ ลบ Event ออกจาก state
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
      setDeleteModalOpen(false);
  
    } catch (error) {
      console.error("❌ Error deleting event:", error);
    }
  };
  

  const handleEditClick = () => {
    setNewEvent({
      id: selectedEvent.id,
      title: selectedEvent.title,
      start: selectedEvent.start,
      end: selectedEvent.end,
      color: selectedEvent.color || "#3788d8",
    });
    setEditMode(true);
    setOpenModal(true);
    setDetailModalOpen(false);
  };
  

  const handleUpdateEvent = async () => {
    const provider = localStorage.getItem("authProvider");
    if (provider !== "google") {
      console.warn("❌ Not a Google user, skipping Google API call");
      return;
    }
  
    if (!newEvent.id) {
      console.error("❌ Event ID not found for update.");
      return;
    }
  
    try {
      const googleToken = localStorage.getItem("googleToken");
      if (!googleToken) {
        console.error("❌ Google Token not found.");
        return;
      }
  
      const updatedEvent = {
        summary: newEvent.title,
        start: {
          dateTime: newEvent.start,
          timeZone: "Asia/Bangkok",
        },
        end: {
          dateTime: newEvent.end || newEvent.start,
          timeZone: "Asia/Bangkok",
        },
      };
  
      console.log(`🔄 Updating Google Event ID: ${newEvent.id}`, updatedEvent);
  
      const response = await fetch(
        `http://localhost:8081/api/update-google-event/${newEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${googleToken}`,
          },
          body: JSON.stringify({ updatedEvent }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Update failed with status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // ✅ อัปเดต event บนหน้าจอ
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === newEvent.id
            ? {
                ...event,
                title: newEvent.title,
                start: newEvent.start,
                end: newEvent.end,
                color: newEvent.color,
              }
            : event
        )
      );
  
      setOpenModal(false);
      setEditMode(false);
      setNewEvent({ title: "", start: "", color: "#3788d8" });
  
      console.log("✅ Event updated.");
    } catch (error) {
      console.error("❌ Error updating event:", error);
    }
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

  const getGoogleAccessToken = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/refresh-google-token");
      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("googleToken", data.access_token);
        return data.access_token;
      } else {
        console.error("❌ Failed to get Google access token:", data);
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching access token:", error);
      return null;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
  
      if (session) {
        const identities = session.user?.identities || [];
        const provider = identities[0]?.provider;
        const token = session.provider_token;
  
        // ✅ normalize
        let normalizedProvider = "unknown";
  
        if (provider === "google" || token.startsWith("ya29")) {
          normalizedProvider = "google";
          localStorage.setItem("googleToken", token);
          setGoogleToken(token);
          localStorage.removeItem("microsoftToken");
        } else if (provider === "azure" || provider === "microsoft") {
          normalizedProvider = "microsoft";
          localStorage.setItem("microsoftToken", token);
          setMicrosoftToken(token);
          localStorage.removeItem("googleToken");
        }
  
        // ✅ Save provider
        localStorage.setItem("authProvider", normalizedProvider);
  
        console.log("✅ Logged in as:", normalizedProvider);
        console.log("🪪 AccessToken:", token);
  
        await fetchEvents();
      } else {
        console.warn("⚠️ No active session");
      }
    };
  
    initialize();
  }, []);


  useEffect(() => {
    console.log("📌 Updated Events:", events);
  }, [events]);

  const renderEventSymbol = (eventInfo) => {
    const dot = document.createElement("span");
    dot.innerHTML = "●"; // ใช้สัญลักษณ์กลม ● หรือเปลี่ยนเป็นอะไรก็ได้
    dot.style.color = eventInfo.event.backgroundColor || eventInfo.event.extendedProps.color || "#4285F4";
    dot.style.fontSize = "14px";
    dot.style.display = "block";
    dot.style.textAlign = "center";

    return { domNodes: [dot] };
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
            dateClick={handleDateClick}// ✅ กดวันที่ -> เปลี่ยน Timeline
            events={events}
            eventContent={renderEventSymbol}
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
          editable={true} // ✅ เปิดใช้งานลากเปลี่ยนเวลา
          eventDrop={handleEventDrop} // ✅ ฟังก์ชันอัปเดตเวลาหลังจากลาก
          selectable={true}
          select={handleSelect} // ✅ เลือกช่วงเวลาเพื่อ Booking
          eventClick={handleEventClick}
          events={events}
        />
      </div>

      {/* Modal for Creating Event */}
      <Modal open={openModal} onClose={() => {
        setOpenModal(false);
        setEditMode(false); // ✅ reset editMode
      }}>
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
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={editMode ? handleUpdateEvent : handleAddEvent}
          >
            {editMode ? "Update" : "Save"}
          </Button>

        </div>
      </Modal>
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)}>
        <div style={styles.modalContent}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setEditingEvent(selectedEvent);
                setEditModalOpen(true);
                setDetailModalOpen(false);
                handleEditClick();
              }}
            >
              ✏️ Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                handleConfirmDelete();          // ✅ เรียกลบทันที
                setDetailModalOpen(false);     // ✅ ปิด modal รายละเอียด
              }}
            >
              🗑 Delete
            </Button>

          </div>

          <h2 style={{ marginBottom: "10px" }}>{selectedEvent?.title}</h2>
          <p><strong>Start:</strong> {new Date(selectedEvent?.start).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(selectedEvent?.end).toLocaleString()}</p>
          <div style={{ marginTop: "10px" }}>
            <span style={{
              backgroundColor: selectedEvent?.color || "#4285F4",
              padding: "6px 12px",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "bold"
            }}>
              Event Color
            </span>
          </div>
        </div>
      </Modal>

    </div>

  );
};


export default CalendarDashboard;
