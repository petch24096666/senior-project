import React, { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { supabase } from "../../../utils/supabaseClient";

const CalendarDashboard = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); 
  const [googleToken, setGoogleToken] = useState(localStorage.getItem("googleToken") || null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [microsoftToken, setMicrosoftToken] = useState(localStorage.getItem("microsoftToken") || null);

   // State for event management
   const [showEventModal, setShowEventModal] = useState(false);
   const [showCategoryModal, setShowCategoryModal] = useState(false);
   const [editingCategory, setEditingCategory] = useState(null);
   const [eventForm, setEventForm] = useState({
     id: null,
     title: '',
     start: '',
     end: '',
     allDay: false,
     description: '',
     location: '',
     color: '#3366FF'
   });
   const [categoryForm, setCategoryForm] = useState({
     id: '',
     name: '',
     color: '#3366FF'
   });
     // Categories for events
  const [categories, setCategories] = useState([
    { id: 'work', name: 'Work', color: '#3366FF' },
    { id: 'personal', name: 'Personal', color: '#33CC66' },
    { id: 'family', name: 'Family', color: '#FF6633' },
    { id: 'health', name: 'Health', color: '#9966FF' },
    { id: 'meeting', name: 'Meeting', color: '#FF3366' },
    { id: 'other', name: 'Other', color: '#999999' }
  ]);

  const fetchEvents = async () => {
    const provider = localStorage.getItem("authProvider")
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
    
          setEvents(events); // อัปเดต state ด้วย events ที่แปลงแล้ว
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

  useEffect(() => {
    if (showEventModal && !editingEvent) {
      const startTime = new Date(selectedDate);
      const endTime = new Date(selectedDate);
      endTime.setHours(startTime.getHours() + 1);
  
      setEventForm({
        id: Date.now(), // Temp ID
        title: '',
        start: formatDateTimeForInput(startTime),
        end: formatDateTimeForInput(endTime),
        allDay: false,
        description: '',
        location: '',
        color: '#3366FF'
      });
    }
  }, [showEventModal, editingEvent, selectedDate]);
  
  
  
  useEffect(() => {
    if (editingEvent) {
      setEventForm({
        id: editingEvent.id,
        title: editingEvent.title,
        start: formatDateTimeForInput(editingEvent.start),
        end: formatDateTimeForInput(editingEvent.end),
        allDay: editingEvent.allDay,
        description: editingEvent.description || '',
        location: editingEvent.location || '',
        color: editingEvent.color
      });
      setShowEventModal(true);
    }
  }, [editingEvent]);


  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    const newCategory = {
      id: editingCategory ? categoryForm.id : `category-${Date.now()}`,
      name: categoryForm.name,
      color: categoryForm.color
    };

    if (editingCategory) {
      setCategories(prev => prev.map(cat =>
        cat.id === editingCategory.id ? newCategory : cat
      ));
    } else {
      setCategories(prev => [...prev, newCategory]);
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = () => {
    if (editingCategory) {
      // Don't delete if there are events using this category
      const eventsUsingCategory = events.some(event => event.color === editingCategory.color);

      if (eventsUsingCategory) {
        alert("Cannot delete this category as it's being used by one or more events");
        return;
      }

      setCategories(prev => prev.filter(cat => cat.id !== editingCategory.id));
      setShowCategoryModal(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteEvent = async () => {
    const provider = localStorage.getItem("authProvider");

    if (!editingEvent) return;

    if (provider === "google" || provider === "microsoft") {
      const token = localStorage.getItem(provider === "google" ? "googleToken" : "microsoftToken");
      const url = provider === "google"
        ? `http://localhost:8081/api/delete-google-event/${editingEvent.id}`
        : `http://localhost:8081/api/delete-microsoft-event/${editingEvent.id}`;

      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // ✅ ลบจาก local state ทุกกรณี
    setEvents(events.filter(event => event.id !== editingEvent.id));
    setShowEventModal(false);
    setEditingEvent(null);
  };


  // Helper to format date for input fields
  const formatDateTimeForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };

  // Helper to format date for display
  const formatDate = (date, format = 'full') => {
    if (format === 'full') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (format === 'monthYear') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (format === 'time') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  };

  // Get days for the month view
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = firstDay.getDay();

    // Array to hold all days to display
    const days = [];

    // Add days from previous month to fill in the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        date: new Date(year, month - 1, day),
        currentMonth: false
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, month, day),
        currentMonth: true
      });
    }

    // Add days from next month to fill out the last week
    const nextDays = 42 - days.length; // 6 rows of 7 days
    for (let day = 1; day <= nextDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        currentMonth: false
      });
    }

    return days;
  };

  // Get days for the week view
  const getDaysInWeek = () => {
    const days = [];
    // Get the first day of the week (Sunday) for the current date
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    // Add 7 days starting from the week start
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Utility functions for date manipulation
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  function isSameDay(date1, date2) {
    // ตรวจสอบและแปลง date1 หากเป็นสตริงหรือมีโครงสร้างพิเศษ
    if (typeof date1 === 'string' || date1 instanceof Object) {
        date1 = new Date(date1);
    }
    // ตรวจสอบและแปลง date2 หากเป็นสตริงหรือมีโครงสร้างพิเศษ
    if (typeof date2 === 'string' || date2 instanceof Object) {
        date2 = new Date(date2);
    }

    if (!(date1 instanceof Date && date2 instanceof Date)) {
        console.error("Invalid date objects provided to isSameDay:", date1, date2);
        return false;
    }

    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}


  // Navigation functions
  const goToPrevious = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'day') {
        newDate.setDate(prevDate.getDate() - 1);
      } else if (viewMode === 'week') {
        newDate.setDate(prevDate.getDate() - 7);
      } else {
        newDate.setMonth(prevDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'day') {
        newDate.setDate(prevDate.getDate() + 1);
      } else if (viewMode === 'week') {
        newDate.setDate(prevDate.getDate() + 7);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    const { title, start, end, allDay, location, description } = eventForm;
    if (!title || !start || !end) {
        alert("Please ensure all required fields are filled out.");
        return;
    }

    // ตรวจสอบและแปลงเป็น Date object ถ้าจำเป็น
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert("Invalid dates. Please enter valid start and end dates.");
        return;
    }

    const eventData = {
        title: title,
        start: startDate,
        end: endDate,
        allDay: allDay,
        location: location,
        description: description
    };

    await handleAddEvent(eventData);
    setShowEventModal(false);
    setEditingEvent(null);
};


  
  // ✅ ฟังก์ชันหลัก
  // ฟังก์ชันหลักในการเพิ่มหรือแก้ไข event
const handleAddEvent = async (newEvent) => {
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

  const startISO = newEvent.start.toISOString();
  const endISO = newEvent.end.toISOString();

  // ข้อมูล event ที่จะส่งไปยัง API
  const eventDetails = {
    title: newEvent.title,
    start: startISO,
    end: endISO,
    allDay: eventForm.allDay,
    location: eventForm.location || "",
    description: eventForm.description || "",
  };

  let addedEvent = null;

  // ตรวจสอบว่าเป็นการแก้ไขหรือสร้างใหม่
  if (editingEvent) {
    // ถ้าเป็นการแก้ไข (edit), ใช้ API สำหรับการอัปเดต
    if (provider === "google") {
      addedEvent = await updateEventInGoogleCalendar(eventDetails, token);
    } else if (provider === "microsoft") {
      addedEvent = await updateEventInMicrosoftCalendar(eventDetails, token);
    }
  } else {
    // ถ้าเป็นการสร้างใหม่ (create), ใช้ API สำหรับการสร้าง
    if (provider === "google") {
      addedEvent = await addEventToGoogleCalendar(eventDetails, token);
    } else if (provider === "microsoft") {
      addedEvent = await addEventToMicrosoftCalendar(eventDetails, token);
    }
  }

  if (addedEvent) {
    // อัปเดตข้อมูล event ใน state
    setEvents((prevEvents) => {
      if (editingEvent) {
        // ถ้าเป็นการแก้ไข, อัปเดต event ใน state
        return prevEvents.map((event) =>
          event.id === addedEvent.id ? addedEvent : event
        );
      } else {
        // ถ้าเป็นการสร้างใหม่, เพิ่ม event ใหม่ลงใน state
        return [...prevEvents, addedEvent];
      }
    });
  }
};
  
  // ✅ เพิ่ม Google API Call
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
            location: event.location,
            description: event.description,
            start: {
              dateTime: event.start,
              timeZone: "Asia/Bangkok",
            },
            end: {
              dateTime: event.end,
              timeZone: "Asia/Bangkok",
            },
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
  
  // ✅ เพิ่ม Microsoft API Call
  const addEventToMicrosoftCalendar = async (event, token) => {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: event.title,
          start: {
            dateTime: event.start,
            timeZone: "Asia/Bangkok",
          },
          end: {
            dateTime: event.end,
            timeZone: "Asia/Bangkok",
          },
          body: {
            contentType: "HTML",
            content: "Created",
          },
        }),
      });
  
      if (!response.ok) throw new Error(`Microsoft error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("❌ Error adding to Microsoft Calendar:", err);
      return null;
    }
  };

  const updateEventInGoogleCalendar = async (event, token) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editingEvent.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: event.title,
            location: event.location,
            description: event.description,
            start: {
              dateTime: event.start,
              timeZone: "Asia/Bangkok",
            },
            end: {
              dateTime: event.end,
              timeZone: "Asia/Bangkok",
            },
          }),
        }
      );
  
      if (!response.ok) throw new Error(`Google error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("❌ Error updating to Google Calendar:", err);
      return null;
    }
  };

  // ฟังก์ชันสำหรับการอัปเดต event ใน Microsoft Calendar
const updateEventInMicrosoftCalendar = async (event, token) => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events/${editingEvent.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: event.title,
          start: {
            dateTime: event.start,
            timeZone: "Asia/Bangkok",
          },
          end: {
            dateTime: event.end,
            timeZone: "Asia/Bangkok",
          },
          body: {
            contentType: "HTML",
            content: event.description,
          },
        }),
      }
    );

    if (!response.ok) throw new Error(`Microsoft error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("❌ Error updating to Microsoft Calendar:", err);
    return null;
  }
};

  // Event handling functions
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day');
      setCurrentDate(date);
    }
  };

  const handleEventFormChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    // ตรวจสอบค่าของ start หรือ end ว่าเป็นค่าที่ถูกต้องหรือไม่
    if (name === "start" || name === "end") {
      const date = new Date(value);
      // ตรวจสอบว่าค่า value ที่กรอกมาเป็นวันที่ที่ถูกต้อง
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", value);
        return;  // หยุดการทำงานหากวันที่ไม่ถูกต้อง
      }
  
      // แปลงให้เป็นรูปแบบที่รองรับ datetime-local
      const formattedDate = date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      setEventForm((prev) => ({
        ...prev,
        [name]: formattedDate,
      }));
    } else {
      // สำหรับกรณีอื่นๆ เช่น checkbox
      setEventForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
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

  const getEventsForDate = (date) => {
    return events.filter(event =>
      isSameDay(event.start, date) ||
      (event.allDay && isSameDay(event.end, date))
    );
  };

  // Get all-day events for a date
  const getAllDayEvents = (date) => {
    return events.filter(event =>
      event.allDay && isSameDay(event.start, date)
    );
  };

  // Get non-all-day events for an hour
  const getEventsForHour = (date, hour) => {
    return events.filter(event =>
      !event.allDay &&
      isSameDay(event.start, date) &&
      event.start.getHours() === hour
    );
  };

  // Generate time slots for day view
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Get time label
  const getTimeLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Days of week for headers
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#F3F4F6',
      padding: '20px',
      color: '#1F2937'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 40px)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        {/* Calendar Header */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              margin: 0
            }}>
              Calendar
            </h1>

            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'day' ? '#F3F4F6' : 'transparent',
                  color: viewMode === 'day' ? '#1F2937' : '#6B7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: viewMode === 'day' ? '600' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>

              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'week' ? '#F3F4F6' : 'transparent',
                  color: viewMode === 'week' ? '#1F2937' : '#6B7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: viewMode === 'week' ? '600' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>

              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'month' ? '#F3F4F6' : 'transparent',
                  color: viewMode === 'month' ? '#1F2937' : '#6B7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: viewMode === 'month' ? '600' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                padding: '8px 12px',
                backgroundColor: '#F3F4F6',
                color: '#1F2937',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={goToToday}
            >
              Today
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={goToPrevious}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={goToNext}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <h2 style={{
              fontSize: '16px',
              fontWeight: '500',
              margin: 0
            }}>
              {viewMode === 'month' ? formatDate(currentDate, 'monthYear') :
                viewMode === 'week' ? `${formatDate(getDaysInWeek()[0], 'full')} - ${formatDate(getDaysInWeek()[6], 'full')}` :
                  formatDate(currentDate, 'full')}
            </h2>

            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => {
                setEditingEvent(null);
                setShowEventModal(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create
            </button>
          </div>
        </div>

        {/* Calendar Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}>
          {/* Sidebar (optional on smaller screens) */}
          <div style={{
            width: '240px',
            borderRight: '1px solid #E5E7EB',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Categories */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                  Categories
                </h3>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      id: '',
                      name: '',
                      color: '#3366FF'
                    });
                    setShowCategoryModal(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '14px', height: '14px' }}>
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Add Category
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {categories.map(category => (
                  <div
                    key={category.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: '#F9FAFB',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        backgroundColor: category.color
                      }}
                    ></span>
                    <span style={{ fontSize: '14px', flex: 1 }}>{category.name}</span>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        cursor: 'pointer',
                        display: 'flex',
                        padding: '2px'
                      }}
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryForm({
                          id: category.id,
                          name: category.name,
                          color: category.color
                        });
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

            {/* Upcoming Events */}
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
                Upcoming Events
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events
                  .filter(event => event.start >= new Date())
                  .sort((a, b) => a.start - b.start)
                  .slice(0, 3)
                  .map(event => (
                    <div
                      key={event.id}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        backgroundColor: '#F9FAFB',
                        borderLeft: `3px solid ${event.color}`,
                        cursor: 'pointer'
                      }}
                      onClick={() => setEditingEvent(event)}
                    >
                      <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {formatDate(event.start, 'full')}
                      </div>
                    </div>
                  ))}

                {events.filter(event => event.start >= new Date()).length === 0 && (
                  <div style={{ fontSize: '14px', color: '#6B7280', padding: '8px' }}>
                    No upcoming events
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Calendar View */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Day View */}
            {viewMode === 'day' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* All-day events */}
                <div style={{
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  minHeight: '60px'
                }}>
                  <div style={{
                    width: '60px',
                    minWidth: '60px',
                    padding: '8px',
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B7280'
                  }}>
                    All day
                  </div>

                  <div style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#FEFAF0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {getAllDayEvents(currentDate).map(event => (
                      <div
                        key={event.id}
                        style={{
                          backgroundColor: event.color,
                          color: 'white',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setEditingEvent(event)}
                      >
                        {event.title}
                      </div>
                    ))}

                    {getAllDayEvents(currentDate).length === 0 && (
                      <div
                        style={{
                          height: '30px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          const today = new Date(currentDate);
                          setSelectedDate(today);
                          setEditingEvent(null);
                          setShowEventModal(true);
                        }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Time slots */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {timeSlots.map(hour => (
                    <div
                      key={hour}
                      style={{
                        display: 'flex',
                        borderBottom: '1px solid #E5E7EB',
                        height: '60px'
                      }}
                    >
                      <div style={{
                        width: '60px',
                        minWidth: '60px',
                        padding: '8px',
                        borderRight: '1px solid #E5E7EB',
                        fontSize: '12px',
                        color: '#6B7280',
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        {getTimeLabel(hour)}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#FEFAF0',
                          padding: '4px',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
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
                            style={{
                              backgroundColor: event.color,
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              zIndex: 10,
                              position: 'relative'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEvent(event);
                            }}
                          >
                            <div>{event.title}</div>
                            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                              {formatDate(event.start, 'time')} - {formatDate(event.end, 'time')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Day headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px repeat(7, 1fr)',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  <div style={{ padding: '12px', borderRight: '1px solid #E5E7EB' }}></div>

                  {getDaysInWeek().map((day, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        borderRight: index < 6 ? '1px solid #E5E7EB' : 'none',
                        backgroundColor: isToday(day) ? '#EFF6FF' : 'white'
                      }}
                    >
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>
                        {daysOfWeekShort[index]}
                      </div>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '4px auto',
                        borderRadius: '50%',
                        backgroundColor: isToday(day) ? '#2563EB' : 'transparent',
                        color: isToday(day) ? 'white' : '#1F2937',
                        fontWeight: '500'
                      }}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* All-day events */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px repeat(7, 1fr)',
                  borderBottom: '1px solid #E5E7EB',
                  minHeight: '60px'
                }}>
                  <div style={{
                    padding: '8px',
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B7280'
                  }}>
                    All day
                  </div>

                  {getDaysInWeek().map((day, index) => {
                    const dayEvents = getAllDayEvents(day);
                    return (
                      <div
                        key={index}
                        style={{
                          padding: '8px',
                          borderRight: index < 6 ? '1px solid #E5E7EB' : 'none',
                          backgroundColor: '#FEFAF0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedDate(day);
                          setEditingEvent(null);
                          setShowEventModal(true);
                        }}
                      >
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            style={{
                              backgroundColor: event.color,
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
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

                {/* Time slots */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {timeSlots.map(hour => (
                    <div
                      key={hour}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px repeat(7, 1fr)',
                        borderBottom: '1px solid #E5E7EB',
                        height: '60px'
                      }}
                    >
                      <div style={{
                        padding: '8px',
                        borderRight: '1px solid #E5E7EB',
                        fontSize: '12px',
                        color: '#6B7280',
                        textAlign: 'center'
                      }}>
                        {getTimeLabel(hour)}
                      </div>

                      {getDaysInWeek().map((day, index) => {
                        const hourEvents = getEventsForHour(day, hour);
                        return (
                          <div
                            key={index}
                            style={{
                              padding: '4px',
                              borderRight: index < 6 ? '1px solid #E5E7EB' : 'none',
                              backgroundColor: '#FEFAF0',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              const date = new Date(day);
                              date.setHours(hour, 0, 0, 0);
                              setSelectedDate(date);
                              setEditingEvent(null);
                              setShowEventModal(true);
                            }}
                          >
                            {hourEvents.map(event => (
                              <div
                                key={event.id}
                                style={{
                                  backgroundColor: event.color,
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
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
            )}

            {/* Month View */}
            {viewMode === 'month' && (
              <div style={{ height: '100%' }}>
                {/* Day headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  borderBottom: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB'
                }}>
                  {daysOfWeekShort.map((day, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        fontWeight: '500',
                        color: '#6B7280'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gridTemplateRows: 'repeat(6, 1fr)',
                  height: 'calc(100% - 45px)',
                  borderLeft: '1px solid #E5E7EB'
                }}>
                  {getDaysInMonth().map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);

                    return (
                      <div
                        key={index}
                        style={{
                          borderRight: '1px solid #E5E7EB',
                          borderBottom: '1px solid #E5E7EB',
                          padding: '8px',
                          backgroundColor: isToday(day.date) ? '#EFF6FF' : 'white',
                          opacity: day.currentMonth ? 1 : 0.5,
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={() => handleDateClick(day.date)}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          marginBottom: '6px'
                        }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: isToday(day.date) ? '#2563EB' : 'transparent',
                            color: isToday(day.date) ? 'white' : '#1F2937',
                            fontWeight: isToday(day.date) ? '600' : '400'
                          }}>
                            {day.date.getDate()}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          marginTop: '2px'
                        }}>
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              style={{
                                backgroundColor: event.color,
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEvent(event);
                              }}
                            >
                              {event.title}
                            </div>
                          ))}

                          {dayEvents.length > 3 && (
                            <div style={{
                              fontSize: '11px',
                              color: '#6B7280',
                              padding: '2px 6px'
                            }}>
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '95%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h2>

              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEventSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Add title"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    From
                  </label>
                  <input
                    type="datetime-local"
                    name="start"
                    value={eventForm.start}
                    onChange={handleEventFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    To
                  </label>
                  <input
                    type="datetime-local"
                    name="end"
                    value={eventForm.end}
                    onChange={handleEventFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="allDay"
                    checked={eventForm.allDay}
                    onChange={handleEventFormChange}
                    style={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span style={{ fontSize: '14px' }}>All day</span>
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Location (optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Add location"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Add description"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {categories.map(category => (
                    <div
                      key={category.id}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        backgroundColor: category.color,
                        cursor: 'pointer',
                        border: eventForm.color === category.color ? '2px solid #1F2937' : '2px solid transparent'
                      }}
                      onClick={() => setEventForm({ ...eventForm, color: category.color })}
                    ></div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {editingEvent && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    style={{
                      padding: '10px',
                      backgroundColor: 'white',
                      color: '#DC2626',
                      border: '1px solid #DC2626',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                    }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#F3F4F6',
                      color: '#1F2937',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {editingEvent ? 'Save' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '95%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>

              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="Category name"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={categoryForm.color}
                  onChange={handleCategoryFormChange}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '2px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    style={{
                      padding: '10px',
                      backgroundColor: 'white',
                      color: '#DC2626',
                      border: '1px solid #DC2626',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                    }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#F3F4F6',
                      color: '#1F2937',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {editingCategory ? 'Save' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default CalendarDashboard;