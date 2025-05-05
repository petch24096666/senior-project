import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom'; // <--- 1. เพิ่ม Import useLocation
import './ModernCalendar.css';
import Header from './Header';
import Sidebar from './Sidebar'; // <-- ตรวจสอบว่า Import Sidebar แล้ว
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import EventModal from './EventModal';
import CategoryModal from './CategoryModal';
import { supabase } from "../../../utils/supabaseClient";

// --- !!! [สำคัญ] แก้ไข Path นี้ให้ถูกต้องตามโครงสร้างโปรเจกต์ Frontend ของคุณ !!! ---
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchCategories, createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory
} from '../../../services/calendarAPI.js';

const ModernCalendar = () => {

  const location = useLocation(); // <--- 2. เรียกใช้ useLocation ที่ Top Level



  // --- ตรวจสอบว่าประกาศ getInitialDate และ getInitialViewMode ตรงนี้ ---
  const getInitialDate = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    if (dateParam) {
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
          const parsedDate = new Date(dateParam + 'T00:00:00Z');
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          } else { console.warn("Invalid date parsed from URL:", dateParam); }
        } else { console.warn("Invalid date format in URL:", dateParam); }
      } catch (e) { console.error("Error parsing date param:", e); }
    }
    return new Date();
  }, [location.search]);

  const getInitialViewMode = useCallback(() => { // <--- ตรวจสอบว่าฟังก์ชันนี้ยังอยู่ และสะกดถูกต้อง
    const params = new URLSearchParams(location.search);
    return params.has('date') ? 'day' : 'month';
  }, [location.search]);
  // --- สิ้นสุดการประกาศ ---

  // --- States (ใช้ Initializer functions แล้ว) ---
  const [currentDate, setCurrentDate] = useState(getInitialDate);
  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  // ตั้งค่าเริ่มต้นจาก URL แค่ครั้งเดียวตอน useState ทำงาน
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [eventForm, setEventForm] = useState({   title: '', start: '', end: '', allDay: false, description: '', location: '', color: '#3366FF'  });
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', color: '#3366FF' });
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  // โหลดตอน mount

  useEffect(() => {
    console.log("Location search changed:", location.search); // เพิ่ม log เพื่อดูว่า Effect ทำงานเมื่อไหร่
    const newInitialDate = getInitialDate(); // เรียกใช้ getInitialDate ได้ตามปกติ
    console.log("New initial date from URL:", newInitialDate);

    // เปรียบเทียบเฉพาะ Date ไม่รวมเวลา เพื่อป้องกันการอัปเดตที่ไม่จำเป็น
    if (currentDate.toDateString() !== newInitialDate.toDateString()) {
       console.log("Current date differs from URL date, updating state.");
       setCurrentDate(newInitialDate);
       setSelectedDate(newInitialDate);
       // *** ไม่ต้องเรียก setViewMode ที่นี่แล้ว ***
    } else {
       console.log("Current date matches URL date, no date state update needed.");
    }

    // Dependency ควรเป็น location.search เพื่อให้ทำงานเมื่อ URL query string เปลี่ยน
  }, [location.search, getInitialDate]); // getInitialDate ต้องใส่เพราะถูกใช้ข้างใน แต่ getInitialViewMode ไม่ต้องแล้ว

  useEffect(() => {
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const provider = session.user.identities[0].provider;           // "google" หรือ "azure"
      const token    = session.provider_token;                        // access_token
      localStorage.setItem("authProvider", provider);
      if (provider === "google") {
        localStorage.setItem("googleToken", token);
      } else if (provider === "azure") {
        localStorage.setItem("microsoftToken", token);
      }
    }
    setSessionReady(true);
  })();
}, []);

  const [userId, setUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) setUserId(session.user.id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const cats = await fetchCategories(userId);
        setCategories(cats);
      } catch (err) {
        console.error('Load categories failed', err);
      }
    })();
  }, [userId]);

  // --- Helper Functions ---
  const formatDateTimeForInput = useCallback((date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const pad = (num) => num.toString().padStart(2, '0');
    try {
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) { console.error("Error formatting date for input:", e); return ''; }
  }, []);

  const formatDate = useCallback((date, format = 'full') => {
    if (!date) return '';
    let dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj)) return '';
    try {
      if (format === 'full') return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (format === 'monthYear') return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (format === 'time') return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return dateObj.toLocaleDateString();
    } catch (e) { console.error("Error formatting date:", e); return ''; }
  }, []);

  const getDaysInMonth = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), currentMonth: false });
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), currentMonth: true });
    }
    const daysGenerated = days.length;
    const nextDaysCount = (daysGenerated <= 35) ? 42 - daysGenerated : 49 - daysGenerated;
    for (let day = 1; day <= nextDaysCount; day++) {
      days.push({ date: new Date(year, month + 1, day), currentMonth: false });
    }
    return days.slice(0, (days.length > 35 ? 42 : 35));
  }, [currentDate]);

  const getDaysInWeek = useCallback(() => {
    const days = [];
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const isToday = useCallback((date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }, []);

  const isSameDay = useCallback((date1, date2) => {
    if (!date1 || !date2) return false;
    let d1 = date1 instanceof Date ? date1 : new Date(date1);
    let d2 = date2 instanceof Date ? date2 : new Date(date2);
    if (isNaN(d1) || isNaN(d2)) return false;
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  }, []);

  // --- Navigation ---
  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'day') newDate.setDate(prev.getDate() - 1);
      else if (viewMode === 'week') newDate.setDate(prev.getDate() - 7);
      else newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'day') newDate.setDate(prev.getDate() + 1);
      else if (viewMode === 'week') newDate.setDate(prev.getDate() + 7);
      else newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const handleDateClick = useCallback((date) => {
    if (!date) return;
    setSelectedDate(date);
    if (viewMode === 'month') {
      setCurrentDate(date);
      setViewMode('day');
    }
  }, [viewMode, setViewMode, setCurrentDate, setSelectedDate]);

  // --- Fetch Data ---
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEvents = await fetchEvents();
      if (Array.isArray(fetchedEvents)) {
         setEvents(fetchedEvents.map(event => ({
           ...event,
           color: event.color,
           start: event.start ? new Date(event.start) : null,
           end: event.end ? new Date(event.end) : null,
           allDay: Boolean(event.allDay)
         })));
      } else {
         console.error("fetchEvents did not return an array:", fetchedEvents);
         setEvents([]);
      }
    } catch (err) {
      setError('Failed to load events. Please check connection or API.');
      console.error("Load Events Error:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const provider = session.user.identities[0].provider; // "google" หรือ "azure"
        const token    = session.provider_token;
        localStorage.setItem('authProvider', provider);
        if (provider === 'google') localStorage.setItem('googleToken', token);
        if (provider === 'azure')  localStorage.setItem('microsoftToken', token);
      }
      setSessionReady(true);
    });
  }, []);

 // ใส่ useEffect ใหม่ที่จะเรียก loadEvents เมื่อ sessionReady เปลี่ยนเป็น true
  useEffect(() => {
    if (sessionReady) loadEvents();
  }, [sessionReady]);

  // --- Handlers for Modals ---
  const openEventModalForCreate = useCallback((startTime) => {
      setSelectedDate(startTime instanceof Date && !isNaN(startTime) ? startTime : new Date());
      setEditingEvent(null);
      setShowEventModal(true);
  }, [setSelectedDate, setEditingEvent, setShowEventModal]);

  const openEventModalForEdit = useCallback((event) => {
      if (!event) return;
      setEditingEvent(event);
      setShowEventModal(true);
  }, [setEditingEvent, setShowEventModal]);

  // --- Event Form Handling (useEffect) ---
  useEffect(() => {
    if (showEventModal) {
      if (editingEvent && editingEvent.start instanceof Date) {
        // Editing Mode
        setEventForm({
          id: editingEvent.id,
          title: editingEvent.title || '',
          start: formatDateTimeForInput(editingEvent.start),
          end: editingEvent.end instanceof Date ? formatDateTimeForInput(editingEvent.end) : '',
          allDay: editingEvent.allDay || false,
          description: editingEvent.description || '',
          location: editingEvent.location || '',
          color: editingEvent.color || categories[0]?.color || '#3366FF'
        });
      } else if (!editingEvent && selectedDate instanceof Date) {
        // Creating Mode - ใช้ selectedDate ที่ได้จากการคลิก
        const startTime = new Date(selectedDate);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);
        setEventForm({
          title: '',
          start: formatDateTimeForInput(startTime), // ใช้เวลาที่คลิก
          end: formatDateTimeForInput(endTime),     // คำนวณเวลาสิ้นสุด
          allDay: false,
          description: '',
          location: '',
          color: categories[0]?.color || '#3366FF'
        });
      } else {
        // Fallback default
        console.warn("Could not determine initial form values, using defaults.");
        const fallbackStartTime = new Date();
        fallbackStartTime.setHours(9,0,0,0);
        const fallbackEndTime = new Date(fallbackStartTime);
        fallbackEndTime.setHours(10,0,0,0);
        setEventForm({
          title: '',
          start: formatDateTimeForInput(fallbackStartTime),
          end: formatDateTimeForInput(fallbackEndTime),
          allDay: false, description: '', location: '', color: '#3366FF'
        });
      }
    }
  }, [showEventModal, editingEvent, selectedDate, categories, formatDateTimeForInput]);

  const handleEventFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setEventForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const ensureSeconds = (dt) => (dt.length === 16 ? dt + ':00' : dt); // ถ้าไม่มีวินาทีให้เติม

  const handleEventSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const payload = {
         ...eventForm,
         user_id: userId,               // ← add this
         allDay: Boolean(eventForm.allDay)
       };

    try {
      let resultEventData;
      if (!editingEvent) {
        resultEventData = await createEvent({ ...payload, user_id: userId });
      } else {
        resultEventData = await updateEvent(editingEvent.id, payload);
      }
       const processedEvent = {
           ...resultEventData,
           start: resultEventData.start ? new Date(resultEventData.start) : null,
           end: resultEventData.end ? new Date(resultEventData.end) : null,
           allDay: Boolean(resultEventData.allDay)
       };
      if (editingEvent) {
        setEvents(prevEvents => prevEvents.map(event => event.id === processedEvent.id ? processedEvent : event));
        console.log("Event updated:", processedEvent);
      } else {
        setEvents(prevEvents => [...prevEvents, processedEvent]);
        console.log("Event created:", processedEvent);
      }
      setShowEventModal(false);
      setEditingEvent(null);
    } catch (err) {
      const errorMsg = `Failed to ${editingEvent ? 'update' : 'create'} event. ${err.message || ''}`;
      setError(errorMsg);
      console.error(errorMsg, err);
      // alert(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [eventForm, editingEvent, setIsLoading, setError, setEvents, setShowEventModal, setEditingEvent]);

  const handleDeleteEvent = useCallback(async () => {
    if (!editingEvent || !editingEvent.id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${editingEvent.title}"?`);
    if (!confirmDelete) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await deleteEvent(editingEvent.id);
      const deletedId = result?.id || editingEvent.id;
      setEvents(prevEvents => prevEvents.filter(event => event.id !== deletedId));
      console.log("Event deleted:", deletedId);
      setShowEventModal(false);
      setEditingEvent(null);
    } catch (err) {
      const errorMsg = `Failed to delete event: ${err.message || ''}`;
      setError(errorMsg);
      console.error(errorMsg, err);
      // alert(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingEvent, setIsLoading, setError, setEvents, setShowEventModal, setEditingEvent]);


  // --- Filtering Functions ---
  const getEventsForDate = useCallback((date) => {
    if (!date || !Array.isArray(events)) return [];
    return events.filter(event => {
      if (!event || !event.start) return false;
      return isSameDay(event.start, date) || (event.allDay && event.end && isSameDay(event.end, date));
    });
  }, [events, isSameDay]);

  const getAllDayEvents = useCallback((date) => {
    if (!date || !Array.isArray(events)) return [];
    return events.filter(event => event?.allDay && event.start && isSameDay(event.start, date));
  }, [events, isSameDay]);

  const getEventsForHour = useCallback((date, hour) => {
    if (!date || !Array.isArray(events)) return [];
    return events.filter(event => {
      if (!event || event.allDay || !event.start) return false;
      return isSameDay(event.start, date) && event.start.getHours() === hour;
    });
  }, [events, isSameDay]);

  // --- Time Slot Generation ---
  const timeSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const getTimeLabel = useCallback((hour) => {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
    return `${h} ${ampm}`;
  }, []);

  // 2) สร้าง / แก้ไข Category
  const handleCategorySubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!userId) return alert('User not ready');
    
    const payload = {
      user_id: userId,
      name:  categoryForm.name,
      color: categoryForm.color
    };

    try {
      if (editingCategory) {
        const updated = await apiUpdateCategory(categoryForm.id, payload);
        setCategories(cs => cs.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await apiCreateCategory(payload);
        setCategories(cs => [...cs, created]);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Category save failed', err);
      alert('บันทึกหมวดหมู่ไม่สำเร็จ');
    }
  }, [categoryForm, editingCategory, userId]);
  
  const handleDeleteCategory = useCallback(async () => {
    if (!editingCategory || !userId) return;
    if (!window.confirm('ลบหมวดหมู่นี้จริงหรือไม่?')) return;

    try {
      await apiDeleteCategory(editingCategory.id, userId);
      setCategories(cs => cs.filter(c => c.id !== editingCategory.id));
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Delete category failed', err);
      alert('ลบหมวดหมู่ไม่สำเร็จ');
    }
  }, [editingCategory, userId]);
  

  // --- Render ---
  return (
      <div className="calendar-container">
        <div className="calendar-wrapper">
            <Header
                viewMode={viewMode}
                setViewMode={setViewMode}
                currentDate={currentDate}
                goToToday={goToToday}
                goToPrevious={goToPrevious}
                goToNext={goToNext}
                formatDate={formatDate}
                getDaysInWeek={getDaysInWeek}
                setShowEventModal={() => openEventModalForCreate(selectedDate)} // ปุ่ม Create หลัก ใช้ selectedDate ปัจจุบัน
            />
            <div className="calendar-content">
                <Sidebar
                  categories={categories}
                  events={events}
                  setEditingCategory={setEditingCategory}
                  setCategoryForm={setCategoryForm}
                  setShowCategoryModal={setShowCategoryModal}
                  setEditingEvent={openEventModalForEdit}
                  formatDate={formatDate}
                />
                <div className="calendar-main">
                    {isLoading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading events...</div>}
                    {error && !isLoading && <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>Error: {error}</div>}
                    {!isLoading && !error && (
                        <>
                            {viewMode === 'day' &&
                              <DayView
                                currentDate={currentDate}
                                timeSlots={timeSlots}
                                getTimeLabel={getTimeLabel}
                                getAllDayEvents={getAllDayEvents}
                                getEventsForHour={getEventsForHour}
                                formatDate={formatDate}
                                // **pass the actual setters** so DayView can open the modal
                                setSelectedDate={setSelectedDate}
                                setEditingEvent={openEventModalForEdit}
                                onSlotClick={openEventModalForCreate}
                              />
                            }
                            {viewMode === 'week' &&
                              <WeekView
                                timeSlots={timeSlots}
                                getTimeLabel={getTimeLabel}
                                getDaysInWeek={getDaysInWeek}
                                isToday={isToday}
                                getAllDayEvents={getAllDayEvents}
                                getEventsForHour={getEventsForHour}
                                // **pass the three setters**
                                setSelectedDate={setSelectedDate}
                                setEditingEvent={openEventModalForEdit}
                                onSlotClick={openEventModalForCreate}
                              />
                            }
                            {viewMode === 'month' &&
                                <MonthView
                                    currentDate={currentDate}
                                    getDaysInMonth={getDaysInMonth}
                                    handleDateClick={handleDateClick}
                                    isToday={isToday}
                                    formatDate={formatDate}
                                    getEventsForDate={getEventsForDate}
                                    setEditingEvent={openEventModalForEdit}
                                    events={events}
                                />
                            }
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Event Modal */}
        {showEventModal &&
            <EventModal
                showEventModal={showEventModal}
                onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
                eventForm={eventForm}
                handleEventFormChange={handleEventFormChange}
                handleEventSubmit={handleEventSubmit}
                editingEvent={editingEvent}
                handleDeleteEvent={handleDeleteEvent}
                categories={categories}
                setEventForm={setEventForm}
            />
        }

        {/* Category Modal */}
        {showCategoryModal &&
          <CategoryModal
            showCategoryModal={showCategoryModal}
            onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
            categoryForm={categoryForm}
            handleCategoryFormChange={e => {
              const { name, value } = e.target;
              setCategoryForm(f => ({ ...f, [name]: value }));
            }}
            handleCategorySubmit={handleCategorySubmit}
            editingCategory={editingCategory}
            handleDeleteCategory={handleDeleteCategory}
          />
        }
      </div>
  );
};

export default ModernCalendar;