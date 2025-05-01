import express from 'express';

import { getAllEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../controllers/calendarpageController.js';
// Import controller functions ที่เราสร้างไว้ใน CalendarController.js
// ตรวจสอบ Path ให้ถูกต้อง ถ้า Controller อยู่ในโฟลเดอร์อื่น
// <<=== ตรวจสอบ Path นี้ให้ถูกต้อง

// สร้าง Router object
const router = express.Router();

// --- กำหนด Routes ---
// Prefix หลักคือ '/api/calendar' (กำหนดใน server.js)

// GET /api/calendar/events - ดึงข้อมูล Event ทั้งหมด
router.get('/events', getAllEvents);

// POST /api/calendar/events - สร้าง Event ใหม่
router.post('/events', createCalendarEvent);

// PUT /api/calendar/events/:id - อัปเดต Event ที่มีอยู่ตาม ID
// ':id' คือ URL parameter ที่จะถูกส่งไปให้ Controller ผ่าน req.params.id
router.put('/events/:id', updateCalendarEvent);

// DELETE /api/calendar/events/:id - ลบ Event ตาม ID
router.delete('/events/:id', deleteCalendarEvent);


// Export router เพื่อให้ server.js นำไปใช้
export default router;