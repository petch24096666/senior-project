// src/controllers/CalendarController.js
import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid'; // ใช้สำหรับสร้าง event_id ที่ไม่ซ้ำกัน
import dayjs from 'dayjs'; // ใช้สำหรับจัดการ/format วันที่และเวลา

// --- GET /api/calendar/events ---
// ดึงข้อมูล Event ทั้งหมด (สำหรับ User ที่ Login อยู่ - ต้องใส่ Logic เพิ่มเติม)
export const getAllEvents = async (req, res) => {
  // const userId = req.user?.id; // ควรดึง userId จากระบบ Auth
  // if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [events] = await db.query(
      `SELECT
         event_id AS id,  -- ส่งกลับไปเป็น id ให้ Frontend ใช้งานง่าย
         user_id,
         title,
         description,
         start_datetime AS \`start\`, -- ตั้งชื่อเป็น start
         end_datetime AS \`end\`,     -- ตั้งชื่อเป็น end
         all_day AS allDay,         -- ตั้งชื่อเป็น allDay
         location,
         color
       FROM calendar_events
       -- WHERE user_id = ? -- ควรจะ Filter ตาม User ID
       ORDER BY start_datetime ASC`,
      // [userId] // ใส่ userId ถ้า Filter
    );

    // แปลงค่า all_day (TINYINT 0/1) ให้เป็น Boolean (true/false)
    const formattedEvents = events.map(event => ({
      ...event,
      allDay: Boolean(event.allDay)
    }));

    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events', details: error.message });
  }
};

// --- POST /api/calendar/events ---
// สร้าง Event ใหม่
export const createCalendarEvent = async (req, res) => {
  const { title, description = null, start, end, allDay = false, location = null, color = '#3366FF' } = req.body;

  // --- [สำคัญ] ต้องดึง User ID จริงจากระบบ Auth ---
  // const userId = req.user?.id;
  const userId = '723563d1-c92e-4ee1-b151-8d0cc14837fd'; // <<== ตัวอย่าง Hardcode (ต้องแก้!)
  if (!userId) {
     return res.status(401).json({ error: 'Unauthorized or User ID missing' });
  }
  // ---

  // --- ตรวจสอบข้อมูลเบื้องต้น ---
  if (!title || !start || !end) {
    return res.status(400).json({ error: 'Missing required fields: title, start, end' });
  }
  // ---

  try {
    // สร้าง event_id ที่ไม่ซ้ำกันด้วย UUID
    const eventId = uuidv4();

    // แปลงเวลาจาก Frontend (ที่ควรเป็น local time string) เป็น Format ที่ DB ต้องการ
    // โดยไม่ยุ่งกับ Timezone เพื่อเก็บค่าตามที่ผู้ใช้เห็น
    const startTimeSQL = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    const endTimeSQL = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
    const allDayValue = allDay ? 1 : 0; // แปลง boolean เป็น 0/1 สำหรับ TINYINT

    // เตรียมข้อมูลสำหรับ INSERT (รวม event_id และ user_id)
    const [result] = await db.query(
      `INSERT INTO calendar_events
         (event_id, user_id, title, description, start_datetime, end_datetime, all_day, location, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,      // ค่า event_id ที่สร้างใหม่
        userId,       // ค่า user_id
        title,
        description,
        startTimeSQL, // เวลาที่ Format แล้ว
        endTimeSQL,   // เวลาที่ Format แล้ว
        allDayValue,
        location,
        color
      ]
    );

    // ดึงข้อมูล Event ที่เพิ่งสร้างเสร็จกลับไปให้ Frontend
    // ใช้ eventId ที่เราสร้างขึ้นในการ Query กลับ
    const [newEventResult] = await db.query(
        `SELECT
           event_id AS id, user_id, title, description,
           start_datetime AS \`start\`, end_datetime AS \`end\`,
           all_day AS allDay, location, color
         FROM calendar_events
         WHERE event_id = ?`,
         [eventId] // ใช้ eventId ที่สร้างจาก uuidv4()
    );

    if (newEventResult.length > 0) {
      // แปลง allDay กลับเป็น Boolean ก่อนส่งกลับ
      const newEvent = {
          ...newEventResult[0],
          allDay: Boolean(newEventResult[0].allDay)
      };
      res.status(201).json(newEvent);
    } else {
      // กรณีนี้ไม่ควรเกิดขึ้นถ้า INSERT สำเร็จ
      console.error(`Inconsistency: Inserted event with event_id ${eventId} but could not retrieve it.`);
      res.status(500).json({ error: 'Failed to retrieve created event after insert.' });
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    // แสดง SQL ที่ Error ด้วย (ถ้ามี) จะช่วย Debug
    if(error.sql) console.error('Failing SQL:', error.sql);
    res.status(500).json({ error: 'Failed to create calendar event', details: error.message });
  }
};

// --- PUT /api/calendar/events/:id ---
// อัปเดต Event ที่มีอยู่ (id ที่รับมาคือ event_id)
export const updateCalendarEvent = async (req, res) => {
  const eventIdFromParam = req.params.id; // รับ event_id จาก URL
  const { title, description, start, end, allDay, location, color } = req.body;
  // const userId = req.user?.id; // ควรดึง userId และตรวจสอบสิทธิ์ความเป็นเจ้าของ

  // --- ตรวจสอบข้อมูลเบื้องต้น ---
  if (!title || !start || !end) {
    return res.status(400).json({ error: 'Missing required fields: title, start, end' });
  }
  // ---

  try {
    // แปลงเวลาจาก Frontend เป็น Format ที่ DB ต้องการ (เหมือนตอน Create)
    const startTimeSQL = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    const endTimeSQL = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
    const allDayValue = allDay ? 1 : 0;

    // ทำการ UPDATE โดยใช้ event_id ใน WHERE clause
    const [result] = await db.query(
      `UPDATE calendar_events
       SET title = ?, description = ?, start_datetime = ?, end_datetime = ?, all_day = ?, location = ?, color = ?
       WHERE event_id = ?`,
       // หากต้องการตรวจสอบสิทธิ์: WHERE event_id = ? AND user_id = ?`, [..., eventIdFromParam, userId]
      [
        title, description, startTimeSQL, endTimeSQL, allDayValue, location, color,
        eventIdFromParam // ID ที่ใช้ใน WHERE clause
      ]
    );

    // ตรวจสอบว่ามีการอัปเดตเกิดขึ้นจริงหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found or no changes made' });
    }

    // ดึงข้อมูล Event ที่เพิ่งอัปเดตกลับไปให้ Frontend
    const [updatedEventResult] = await db.query(
        `SELECT
           event_id AS id, user_id, title, description,
           start_datetime AS \`start\`, end_datetime AS \`end\`,
           all_day AS allDay, location, color
         FROM calendar_events
         WHERE event_id = ?`,
         [eventIdFromParam]
    );

     if (updatedEventResult.length > 0) {
        // แปลง allDay กลับเป็น Boolean ก่อนส่งกลับ
        const updatedEvent = {
            ...updatedEventResult[0],
            allDay: Boolean(updatedEventResult[0].allDay)
        };
        res.status(200).json(updatedEvent);
     } else {
       // ไม่ควรเกิดขึ้นถ้า Update สำเร็จ
       res.status(404).json({ error: 'Event not found after update' });
     }

  } catch (error) {
    console.error('Error updating calendar event:', error);
     if(error.sql) console.error('Failing SQL:', error.sql);
    res.status(500).json({ error: 'Failed to update calendar event', details: error.message });
  }
};

// --- DELETE /api/calendar/events/:id ---
// ลบ Event (id ที่รับมาคือ event_id)
export const deleteCalendarEvent = async (req, res) => {
  const eventIdFromParam = req.params.id; // รับ event_id จาก URL
  // const userId = req.user?.id; // ควรดึง userId และตรวจสอบสิทธิ์ความเป็นเจ้าของ

  try {
    // ทำการ DELETE โดยใช้ event_id ใน WHERE clause
    const [result] = await db.query(
      `DELETE FROM calendar_events WHERE event_id = ?`,
       // หากต้องการตรวจสอบสิทธิ์: WHERE event_id = ? AND user_id = ?`, [eventIdFromParam, userId]
      [eventIdFromParam]
    );

    // ตรวจสอบว่ามีการลบเกิดขึ้นจริงหรือไม่
    if (result.affectedRows === 0) {
       return res.status(404).json({ error: 'Event not found' });
    }

    // ส่ง id (ซึ่งคือ event_id) ที่ลบกลับไปให้ Frontend ยืนยัน
    res.status(200).json({ message: 'Event deleted successfully', id: eventIdFromParam });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
     if(error.sql) console.error('Failing SQL:', error.sql);
    res.status(500).json({ error: 'Failed to delete calendar event', details: error.message });
  }
};