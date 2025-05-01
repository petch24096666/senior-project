// src/services/calendarApi.js
const API_BASE_URL = 'http://localhost:8081/api/calendar'; // หรือ URL ของ Backend Demo ของคุณ

// Function สำหรับแปลง ISO String เป็น Date Object
const parseEventDates = (event) => ({
  ...event,
  start: event.start ? new Date(event.start) : null,
  end: event.end ? new Date(event.end) : null,
});

export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const events = await response.json();
    // แปลง start/end string เป็น Date objects ก่อนส่งกลับ
    return events.map(parseEventDates);
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error; // โยน error ต่อเพื่อให้ component จัดการ
  }
};

export const createEvent = async (eventData) => {
  try {
    // ไม่ต้องส่ง ID ชั่วคราวไป, Backend จะสร้าง ID ให้
    const { id, ...payload } = eventData;
    // eventData.start และ eventData.end ควรเป็น String จาก datetime-local อยู่แล้ว
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // ส่งข้อมูลที่ไม่มี id ชั่วคราว
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const createdEvent = await response.json();
    // แปลง start/end string เป็น Date objects ก่อนส่งกลับ
    return parseEventDates(createdEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
     // ไม่ต้องส่ง ID ใน payload
     const { id, ...payload } = eventData;
    // eventData.start และ eventData.end ควรเป็น String จาก datetime-local อยู่แล้ว
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedEvent = await response.json();
     // แปลง start/end string เป็น Date objects ก่อนส่งกลับ
    return parseEventDates(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Backend ควรตอบกลับ JSON ที่มี id ที่ลบไป หรือ message
    const result = await response.json();
    return result; // อาจจะคืน { message: "...", id: "..." }
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};