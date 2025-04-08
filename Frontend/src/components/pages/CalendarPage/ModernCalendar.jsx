import React, { useState, useEffect } from 'react';
import './ModernCalendar.css';
import Header from './Header';
import Sidebar from './Sidebar';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import EventModal from './EventModal';
import CategoryModal from './CategoryModal';

const ModernCalendar = () => {
  // States หลัก
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  
  // States สำหรับ modal และการแก้ไข
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Forms สำหรับ event และ category
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
  
  // ข้อมูล categories และ events เริ่มต้น
  const [categories, setCategories] = useState([
    { id: 'work', name: 'Work', color: '#3366FF' },
    { id: 'personal', name: 'Personal', color: '#33CC66' },
    { id: 'family', name: 'Family', color: '#FF6633' },
    { id: 'health', name: 'Health', color: '#9966FF' },
    { id: 'meeting', name: 'Meeting', color: '#FF3366' },
    { id: 'other', name: 'Other', color: '#999999' }
  ]);
  
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Team Meeting',
      start: new Date(2025, 2, 29, 10, 0),
      end: new Date(2025, 2, 29, 11, 30),
      allDay: false,
      description: 'Weekly team sync meeting',
      location: 'Conference Room A',
      category: 'work',
      color: '#3366FF'
    },
    {
      id: 2,
      title: 'Doctor Appointment',
      start: new Date(2025, 2, 30, 14, 0),
      end: new Date(2025, 2, 30, 15, 0),
      allDay: false,
      description: 'Annual checkup',
      location: 'Medical Center',
      category: 'health',
      color: '#9966FF'
    },
    {
      id: 3,
      title: 'Birthday Party',
      start: new Date(2025, 3, 5, 0, 0),
      end: new Date(2025, 3, 5, 23, 59),
      allDay: true,
      description: 'Sarah\'s birthday celebration',
      location: 'Home',
      category: 'family',
      color: '#FF6633'
    }
  ]);
  
  // Helper functions
  const formatDateTimeForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };

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

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        date: new Date(year, month - 1, day),
        currentMonth: false
      });
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, month, day),
        currentMonth: true
      });
    }
    const nextDays = 42 - days.length;
    for (let day = 1; day <= nextDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        currentMonth: false
      });
    }
    return days;
  };

  const getDaysInWeek = () => {
    const days = [];
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

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

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day');
      setCurrentDate(date);
    }
  };

  // Event modal: initialize formเมื่อเปิด modalใหม่
  useEffect(() => {
    if (showEventModal && !editingEvent) {
      const now = new Date();
      const startTime = new Date(selectedDate);
      startTime.setHours(now.getHours());
      startTime.setMinutes(0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      setEventForm({
        id: Date.now(),
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

  const handleEventFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: eventForm.id,
      title: eventForm.title,
      start: new Date(eventForm.start),
      end: new Date(eventForm.end),
      allDay: eventForm.allDay,
      description: eventForm.description,
      location: eventForm.location,
      color: eventForm.color
    };
    if (editingEvent) {
      setEvents(events.map(event => event.id === editingEvent.id ? newEvent : event));
    } else {
      setEvents([...events, newEvent]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      setEvents(events.filter(event => event.id !== editingEvent.id));
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event =>
      isSameDay(event.start, date) || (event.allDay && isSameDay(event.end, date))
    );
  };

  const getAllDayEvents = (date) => {
    return events.filter(event => event.allDay && isSameDay(event.start, date));
  };

  const getEventsForHour = (date, hour) => {
    return events.filter(event =>
      !event.allDay && isSameDay(event.start, date) && event.start.getHours() === hour
    );
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const getTimeLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

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
          setShowEventModal={() => { setEditingEvent(null); setShowEventModal(true); }}
        />
        <div className="calendar-content">
          <Sidebar 
            categories={categories}
            events={events}
            setEditingCategory={setEditingCategory}
            setCategoryForm={setCategoryForm}
            setShowCategoryModal={setShowCategoryModal}
            setEditingEvent={setEditingEvent}
            formatDate={formatDate}
          />
          <div className="calendar-main">
            {viewMode === 'day' && (
              <DayView 
                currentDate={currentDate}
                timeSlots={timeSlots}
                getTimeLabel={getTimeLabel}
                getAllDayEvents={getAllDayEvents}
                getEventsForHour={getEventsForHour}
                setSelectedDate={setSelectedDate}
                setShowEventModal={setShowEventModal}
                setEditingEvent={setEditingEvent}
                formatDate={formatDate}
              />
            )}
            {viewMode === 'week' && (
              <WeekView 
                timeSlots={timeSlots}
                getTimeLabel={getTimeLabel}
                getDaysInWeek={getDaysInWeek}
                isToday={isToday}
                getAllDayEvents={getAllDayEvents}
                getEventsForHour={getEventsForHour}
                setSelectedDate={setSelectedDate}
                setShowEventModal={setShowEventModal}
                setEditingEvent={setEditingEvent}
              />
            )}
            {viewMode === 'month' && (
              <MonthView 
                currentDate={currentDate}
                getDaysInMonth={getDaysInMonth}
                handleDateClick={handleDateClick}
                isToday={isToday}
                formatDate={formatDate}
                getEventsForDate={getEventsForDate}
              />
            )}
          </div>
        </div>
      </div>
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
      <CategoryModal 
        showCategoryModal={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        categoryForm={categoryForm}
        handleCategoryFormChange={(e) => {
          const { name, value } = e.target;
          setCategoryForm(prev => ({ ...prev, [name]: value }));
        }}
        handleCategorySubmit={(e) => {
          e.preventDefault();
          const newCategory = {
            id: editingCategory ? categoryForm.id : `category-${Date.now()}`,
            name: categoryForm.name,
            color: categoryForm.color
          };
          if (editingCategory) {
            setCategories(categories.map(cat => cat.id === editingCategory.id ? newCategory : cat));
          } else {
            setCategories([...categories, newCategory]);
          }
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        handleDeleteCategory={() => {
          if (editingCategory) {
            const eventsUsingCategory = events.some(event => event.color === editingCategory.color);
            if (eventsUsingCategory) {
              alert("Cannot delete this category as it's being used by one or more events");
              return;
            }
            setCategories(categories.filter(cat => cat.id !== editingCategory.id));
            setShowCategoryModal(false);
            setEditingCategory(null);
          }
        }}
      />
    </div>
  );
};

export default ModernCalendar;
