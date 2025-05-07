// src/controllers/calendarController.js
import db from '../config/database.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const GOOGLE_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const GOOGLE_COLORS = 'https://www.googleapis.com/calendar/v3/colors';
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
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    // 1) ดึง events จากฐานข้อมูล
    const [dbRows] = await db.query(
      `SELECT
         event_id       AS id,
         user_id,
         title,
         description,
         start_datetime AS start,
         end_datetime   AS end,
         all_day        AS allDay,
         location,
         color
       FROM calendar_events
       WHERE user_id = ?
       ORDER BY start_datetime`,
      [userId]
    );
    const localEvents = dbRows.map(e => ({
      ...e,
      allDay: Boolean(e.allDay)
    }));

    // 2) ถ้ามี Google/Azure token ให้ fetch เพิ่มเติม
    const { provider, token } = getAuth(req);
    let providerEvents = [];

    if (provider === 'google' && token) {
      // เตรียม header
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      // 2.1) ดึง color map
      const { data: colorsData } = await axios.get(GOOGLE_COLORS, headers);
      const eventColorMap = colorsData.event || {};

      // 2.2) ดึงรายการ events
      const { data: listData } = await axios.get(GOOGLE_BASE, headers);

      // 2.3) map แต่ละ event พร้อมสีจริง
      providerEvents = (listData.items || []).map(item => {
        const bgColor = eventColorMap[item.colorId]?.background || '#4285F4';
        return {
          id:          item.id,
          title:       item.summary    || '',
          start:       item.start.dateTime || item.start.date,
          end:         item.end.dateTime   || item.end.date,
          allDay:      Boolean(item.start.date && !item.start.dateTime),
          description: item.description || '',
          location:    item.location    || '',
          color:       bgColor
        };
      });
    }
    else if (provider === 'azure' && token) {
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(MS_BASE, headers);
      providerEvents = (data.value || []).map(item => ({
        id:          item.id,
        title:       item.subject         || '',
        start:       new Date(item.start.dateTime).getTime(),
        end:         new Date(item.end.dateTime).getTime(),
        allDay:      Boolean(item.isAllDay),
        description: item.body?.content   || '',
        location:    item.location?.displayName || '',
        color:       '#0078D4'
      }));
    }

    // 3) กรองไม่ให้ซ้ำกัน (local vs provider) แล้วรวมผลลัพธ์
    let resultEvents;
    if (provider && token) {
      const providerIds = new Set(providerEvents.map(e => e.id));
      const onlyLocal    = localEvents.filter(e => !providerIds.has(e.id));
      resultEvents       = [...onlyLocal, ...providerEvents];
    } else {
      resultEvents = localEvents;
    }

    // 4) ส่งกลับ
    return res.json(resultEvents);

  } catch (error) {
    console.error('getAllEvents error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// --- POST /api/calendar/events ---
export const createCalendarEvent = async (req, res) => {
  const {
    title, description, start, end,
    allDay = false, location,
    color,    // <-- hex string มาจาก frontend (CategoryModal)
    user_id
  } = req.body;
  const { provider, token } = getAuth(req);

  if (provider === 'google' && token) {
    // 1) เตรียม headers
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    // 2) ดึง color map จาก Google (/colors)
    const { data: colorsData } = await axios.get(GOOGLE_COLORS, headers);
    const eventColorMap = {
      "1":  { background: "#a4bdfc", foreground: "#1d1d1d" },
      "2":  { background: "#7ae7bf", foreground: "#1d1d1d" },
      "3":  { background: "#dbadff", foreground: "#1d1d1d" },
      "4":  { background: "#ff887c", foreground: "#1d1d1d" },
      "5":  { background: "#fbd75b", foreground: "#1d1d1d" },
      "6":  { background: "#ffb878", foreground: "#1d1d1d" },
      "7":  { background: "#46d6db", foreground: "#1d1d1d" },
      "8":  { background: "#e1e1e1", foreground: "#1d1d1d" },
      "9":  { background: "#5484ed", foreground: "#1d1d1d" },
      "10": { background: "#51b749", foreground: "#1d1d1d" },
      "11": { background: "#dc2127", foreground: "#1d1d1d" }
    };
    // eventColorMap: { "1": { background: "#a4bdfc", … }, "2": { background: "#7ae7bf", … }, … }

    // 3) สร้าง reverse lookup: hex → colorId
    const hexToColorId = Object.entries(eventColorMap).reduce((acc, [id, val]) => {
      acc[val.background] = id;
      return acc;
    }, {});
    const chosenColorId = hexToColorId[color]; // e.g. "5" ถ้า user เลือก "#52b69a"
    
    // 4) สร้าง body สำหรับ POST /events
    const body = {
      summary:     title,
      description,
      location,
      start:  allDay
              ? { date: start }
              : { dateTime: start, timeZone: 'Asia/Bangkok' },
      end:    allDay
              ? { date: end }
              : { dateTime: end,   timeZone: 'Asia/Bangkok' },
      // <-- ใส่ colorId ถ้าเจอ
      ...(chosenColorId && { colorId: chosenColorId })
    };

    // 5) เรียกสร้าง event
    const { data: googleEvent } = await axios.post(
      GOOGLE_BASE,
      body,
      headers
    );

    // 6) แปลงกลับจาก googleEvent.colorId → hex (fallback เป็น req.body.color หรือ default)
    const returnedColor =
      eventColorMap[googleEvent.colorId]?.background
      || color
      || '#4285F4';

    // 7) return ให้ frontend
    return res.json({
      id:          googleEvent.id,
      title:       googleEvent.summary    || '',
      start:       googleEvent.start.dateTime || googleEvent.start.date,
      end:         googleEvent.end.dateTime   || googleEvent.end.date,
      allDay:      Boolean(googleEvent.start.date && !googleEvent.start.dateTime),
      description: googleEvent.description || '',
      location:    googleEvent.location    || '',
      color:       returnedColor
    });
  }

  // —— Azure branch ——
  if (provider === 'azure' && token) {
    // ตรวจสอบเวลา
    if (new Date(end) <= new Date(start)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // สร้าง payload ให้ Graph API
    const msBody = {
      subject: title,
      body: {
        contentType: 'HTML',
        content: description || ''
      },
      start: {
        dateTime: start,           // ควรเป็น ISO string เช่น '2025-05-07T08:00:00'
        timeZone: 'Asia/Bangkok'
      },
      end: {
        dateTime: end,
        timeZone: 'Asia/Bangkok'
      },
      // ใช้ชื่อฟิลด์ถูกต้องคือ `location`
      location: {
        displayName: location || ''
      },
      isAllDay: Boolean(allDay)
    };

    try {
      const { data: msEvent } = await axios.post(
        MS_BASE,
        msBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // map result แล้ว return ให้ client
      return res.json({
        id: msEvent.id,
        title: msEvent.subject,
        start: msEvent.start.dateTime.getTime(),
        end:   msEvent.end.dateTime.getTime(),
        allDay: msEvent.isAllDay,
        description: msEvent.body.content,
        location: msEvent.location.displayName,
        color: '#0078D4'
      });
    } catch (e) {
      console.error('Azure create error:', e.response?.data || e.message);
      return res
        .status(e.response?.status || 500)
        .json({ error: e.response?.data || e.message });
    }
  }

  // —— Local-only branch ——
  // ถ้าไม่มี provider หรือ token ให้เขียนลง DB เหมือนเดิม
  const eventId = uuidv4();
  await db.query(
    `INSERT INTO calendar_events
       (event_id, user_id, title, description, start_datetime, end_datetime, all_day, location, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [eventId, req.query.user_id, title, description, start, end, allDay, location, req.body.color]
  );
  return res.json({
    id: eventId,
    title,
    start,
    end,
    allDay,
    description,
    location,
    color: req.body.color,
  });
};



// --- PUT /api/calendar/events/:id ---
export const updateCalendarEvent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    start,
    end,
    allDay = false,
    location,
    color,
    user_id
  } = req.body;
  const { provider, token } = getAuth(req);

  // —— Google branch: PATCH พร้อม colorId —— 
  if (provider === 'google' && token) {
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    // ดึง mapping สีจาก Google
    const { data: colorsData } = await axios.get(GOOGLE_COLORS, headers);
    const eventColorMap = colorsData.event || {};

    // สร้าง reverse lookup: hex → colorId
    const hexToColorId = Object.entries(eventColorMap)
      .reduce((acc, [cid, { background }]) => {
        acc[background] = cid;
        return acc;
      }, {});
    const chosenColorId = hexToColorId[color];  // อาจ undefined

    // สร้าง payload สำหรับ PATCH
    const googleBody = {
      summary:     title,
      description,
      location,
      start:       allDay
                   ? { date: start }
                   : { dateTime: start, timeZone: 'Asia/Bangkok' },
      end:         allDay
                   ? { date: end }
                   : { dateTime: end,   timeZone: 'Asia/Bangkok' },
      ...(chosenColorId && { colorId: chosenColorId })
    };

    await axios.patch(
      `${GOOGLE_BASE}/${id}`,
      googleBody,
      headers
    );
    // ไม่ต้อง return ตรงนี้ เพราะเราจะ Upsert ลง DB และ return แถว DB ด้านล่าง
  }

  // —— Azure branch: PATCH แก้ด้วย Microsoft Graph —— 
  if (provider === 'azure' && token) {
    // ตรวจสอบเวลา
    if (new Date(end) <= new Date(start)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    const msBody = {
      subject: title,
      body: {
        contentType: 'HTML',
        content: description || ''
      },
      start: {
        dateTime: start,
        timeZone: 'Asia/Bangkok'
      },
      end: {
        dateTime: end,
        timeZone: 'Asia/Bangkok'
      },
      location: {
        displayName: location || ''
      },
      isAllDay: Boolean(allDay)
    };

    await axios.patch(
      `${MS_BASE}/${id}`,
      msBody,
      headers
    );
    // ไม่ต้อง return ตรงนี้เช่นกัน
  }

  // —— Local-only & DB upsert —— 
  await db.query(
    `INSERT INTO calendar_events
       (event_id, user_id, title, description, start_datetime, end_datetime, all_day, location, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title        = VALUES(title),
       description  = VALUES(description),
       start_datetime = VALUES(start_datetime),
       end_datetime   = VALUES(end_datetime),
       all_day        = VALUES(all_day),
       location       = VALUES(location),
       color          = VALUES(color);`,
    [
      id,
      user_id,
      title,
      description,
      dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
      allDay ? 1 : 0,
      location,
      color
    ]
  );

  // อ่านแถวที่อัปเดตแล้วคืนให้ client
  const [[row]] = await db.query(
    `SELECT
       event_id   AS id,
       user_id,
       title,
       description,
       start_datetime AS start,
       end_datetime   AS end,
       all_day       AS allDay,
       location,
       color
     FROM calendar_events
     WHERE event_id = ?`,
    [id]
  );

  return res.json({ ...row, allDay: Boolean(row.allDay) });
};

// --- DELETE /api/calendar/events/:id ---
export const deleteCalendarEvent = async (req, res) => {
  const { id } = req.params;
  const { provider, token } = getAuth(req);

  // 1) ลบบน provider ก่อน
  if (provider === 'google' && token) {
    await axios.delete(`${GOOGLE_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } else if ((provider === 'azure') && token) {
    await axios.delete(`${MS_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  // else local-only → skip

  // 2) ลบจาก DB
  await db.query(
    `DELETE FROM calendar_events WHERE event_id = ?`,
    [id]
  );
  return res.json({ id });
};


// GET /api/calendar/categories?user_id=xxx
export const getAllCategories = async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });

  try {
    const [rows] = await db.query(
      `SELECT
         category_id AS id,
         user_id,
         name,
         color,
         created_at,
         updated_at
       FROM categories
       WHERE user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/calendar/categories
// body: { user_id, name, color }
export const createCategory = async (req, res) => {
  const { user_id: userId, name, color } = req.body;
  if (!userId || !name || !color) {
    return res.status(400).json({ error: 'user_id, name and color are required' });
  }

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO categories
         (category_id, user_id, name, color)
       VALUES (?, ?, ?, ?)`,
      [id, userId, name, color]
    );
    res.status(201).json({ id, user_id: userId, name, color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/calendar/categories/:id
// body: { user_id, name, color }
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { user_id: userId, name, color } = req.body;
  if (!userId || !name || !color) {
    return res.status(400).json({ error: 'user_id, name and color are required' });
  }

  try {
    const [result] = await db.query(
      `UPDATE categories
         SET name = ?, color = ?
       WHERE category_id = ? AND user_id = ?`,
      [name, color, id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found or no permission' });
    }
    res.json({ id, user_id: userId, name, color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/calendar/categories/:id?user_id=xxx
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });

  try {
    const [result] = await db.query(
      `DELETE FROM categories
       WHERE category_id = ? AND user_id = ?`,
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found or no permission' });
    }
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};