// src/controllers/calendarController.js
import db from '../config/database.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const GOOGLE_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const MS_BASE     = 'https://graph.microsoft.com/v1.0/me/events';

// helper: ดึง token + provider จาก Header
function getAuth(req) {
  const authHeader = req.headers.authorization?.split(' ');
  return {
    provider: req.headers['x-auth-provider'],
    token: authHeader?.[1]
  };
}

// --- GET /api/calendar/events ---
export const getAllEvents = async (req, res) => {
  try {
    // 1) ดึงจากฐานข้อมูล
    const [dbEvents] = await db.query(
      `SELECT event_id AS id, user_id, title, description,
              start_datetime AS start, end_datetime AS end,
              all_day AS allDay, location, color
       FROM calendar_events
       ORDER BY start_datetime`
    );
    const local = dbEvents.map(e => ({ ...e, allDay: Boolean(e.allDay) }));

    // 2) ดึงจาก Google/Microsoft (ถ้ามี)
    const { provider, token } = getAuth(req);
    let third = [];
    if (provider === 'google' && token) {
      const { data } = await axios.get(GOOGLE_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      third = (data.items||[]).map(item => ({
        id: item.id,
        title: item.summary,
        start: item.start.dateTime||item.start.date,
        end:   item.end.dateTime  ||item.end.date,
        allDay: Boolean(item.start.date && !item.start.dateTime),
        description: item.description||'',
        location: item.location||'',
        color: '#4285F4'
      }));
    }
    else if (provider === 'microsoft' && token) {
      const { data } = await axios.get(MS_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      third = (data.value||[]).map(item => ({
        id: item.id,
        title: item.subject,
        start: item.start.dateTime,
        end:   item.end.dateTime,
        allDay: item.isAllDay||false,
        description: item.body?.content||'',
        location: item.location?.displayName||'',
        color: '#0078D4'
      }));
    }

    res.json([...local, ...third]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// --- POST /api/calendar/events ---
export const createCalendarEvent = async (req, res) => {
  const { title, description, start, end, allDay=false, location, color } = req.body;
  const { provider, token } = getAuth(req);

  try {
    if (provider === 'google') {
      const { data } = await axios.post(GOOGLE_BASE, {
        summary:     title,
        description,
        location,
        start: { dateTime: start, timeZone: 'Asia/Bangkok' },
        end:   { dateTime: end,   timeZone: 'Asia/Bangkok' }
      }, { headers: { Authorization: `Bearer ${token}` }});
      return res.status(201).json({
        id: data.id, title: data.summary,
        start: data.start.dateTime||data.start.date,
        end:   data.end.dateTime  ||data.end.date,
        allDay: Boolean(data.start.date&&!data.start.dateTime),
        description: data.description||'',
        location: data.location||'',
        color: '#4285F4'
      });
    }
    if (provider === 'microsoft') {
      const { data } = await axios.post(MS_BASE, {
        subject: title,
        body: { contentType: 'HTML', content: description||'' },
        start: { dateTime: start, timeZone: 'Asia/Bangkok' },
        end:   { dateTime: end,   timeZone: 'Asia/Bangkok' },
        location: { displayName: location||'' }
      }, { headers: { Authorization: `Bearer ${token}` }});
      return res.status(201).json({
        id: data.id, title: data.subject,
        start: data.start.dateTime, end: data.end.dateTime,
        allDay: data.isAllDay||false,
        description: data.body?.content||'',
        location: data.location?.displayName||'',
        color: '#0078D4'
      });
    }

    // ถ้า local: สร้างที่ DB
    const eventId = uuidv4();
    await db.query(
      `INSERT INTO calendar_events
         (event_id,user_id,title,description,start_datetime,end_datetime,all_day,location,color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ eventId, /*TODO: ดึง userId จาก Auth*/ 'user-id', title, description,
        dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
        allDay?1:0, location, color||'#3366FF' ]
    );
    const [[newEv]] = await db.query(
      `SELECT event_id AS id,title,description,
              start_datetime AS start,end_datetime AS end,
              all_day AS allDay,location,color
       FROM calendar_events WHERE event_id = ?`,
      [eventId]
    );
    res.status(201).json({ ...newEv, allDay: Boolean(newEv.allDay) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// --- PUT /api/calendar/events/:id ---
export const updateCalendarEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, start, end, location } = req.body;
  const { provider, token } = getAuth(req);

  try {
    if (provider === 'google') {
      // 1) เข้ารหัส ID เผื่อมีอักขระพิเศษ
      const encodedId = encodeURIComponent(id);

      // 2) ฟอร์แมตวันที่ให้เป็น ISO 8601 พร้อมวินาที+offset
      const formattedStart = dayjs(start).toISOString(); // e.g. "2025-05-06T07:00:00+07:00"
      const formattedEnd   = dayjs(end  ).toISOString(); // e.g. "2025-05-07T07:00:00+07:00"

      // 3) ใช้ PUT (อัปเดต resource ทั้งหมด) แทน PATCH
      const { data } = await axios.put(
        `${GOOGLE_BASE}/${encodedId}`,
        {
          summary:     title,
          description,
          location,
          start: { dateTime: formattedStart, timeZone: 'Asia/Bangkok' },
          end:   { dateTime: formattedEnd,   timeZone: 'Asia/Bangkok' },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.json({
        id:          data.id,
        title:       data.summary,
        start:       data.start.dateTime,
        end:         data.end.dateTime,
        allDay:      Boolean(data.start.date && !data.start.dateTime),
        description: data.description || '',
        location:    data.location    || '',
        color:       '#4285F4'        // สีเดียวกับตอน fetch Google events
        });
    }
    if (provider === 'microsoft') {
      const url = `${MS_BASE}/${id}`;
      const { data } = await axios.patch(url, {
        subject: title,
        body: { contentType: 'HTML', content: description||'' },
        start: { dateTime: start, timeZone: 'Asia/Bangkok' },
        end:   { dateTime: end,   timeZone: 'Asia/Bangkok' },
        location: { displayName: location||'' }
      }, { headers: { Authorization: `Bearer ${token}` }});
      return res.json({
              id:          data.id,
              title:       data.subject,
              start:       data.start.dateTime,
              end:         data.end.dateTime,
              allDay:      data.isAllDay || false,
              description: data.body?.content || '',
              location:    data.location?.displayName || '',
              color:       '#0078D4'      // สีของ Microsoft events
            });
          }

    // local update
    await db.query(
      `UPDATE calendar_events
         SET title=?,description=?,start_datetime=?,end_datetime=?,all_day=?,location=?,color=?
       WHERE event_id = ?`,
      [ title, description,
        dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
        allDay?1:0, location, color, id ]
    );
    const [[upd]] = await db.query(
      `SELECT event_id AS id,title,description,
              start_datetime AS start,end_datetime AS end,
              all_day AS allDay,location,color
       FROM calendar_events WHERE event_id = ?`,
      [id]
    );
    res.json({ ...upd, allDay: Boolean(upd.allDay) });
  } catch (err) {
    console.error('Google update error:', err.response?.data || err.message);
    // ส่งกลับข้อความ error จาก Google เพื่อดีบักต่อ
    return res.status(400).json({
      error: err.response?.data?.error?.message || err.message
    });
  }
};

// --- DELETE /api/calendar/events/:id ---
export const deleteCalendarEvent = async (req, res) => {
  const { id } = req.params;
  const { provider, token } = getAuth(req);

  try {
    if (provider === 'google') {
      // เข้ารหัส ID แล้วเรียก delete แบบเดียวกับ update
      const encodedId = encodeURIComponent(id);
      await axios.delete(
        `${GOOGLE_BASE}/${encodedId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.json({ id });
    }
    // local delete
    const [result] = await db.query(
      `DELETE FROM calendar_events WHERE event_id = ?`, [id]
    );
    if (result.affectedRows===0) return res.status(404).json({ error:'Not found' });
    res.json({ id });
  } catch (err) {
    console.error('Google delete error:', err.response?.data || err.message);
    return res.status(400).json({
      error: err.response?.data?.error?.message || err.message
    });
  }
};
