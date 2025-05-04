// src/controllers/meetingsController.js
import db from '../config/database.js';
import { createZoomMeeting } from './zoomController.js';
import { createGoogleMeeting } from './googleController.js';
import { createTeamsMeeting } from './microsoftController.js';
import { createWebexMeeting } from './webexController.js';


// 🔹 CREATE
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,
      duration,
      platform,
      frequency,
      reminder,
      participants = [],
      user_id,
      token
    } = req.body;

    // คำนวณ end_time จาก duration
    const end_time = new Date(new Date(start_time).getTime() + Number(duration) * 60000).toISOString();

    // สร้าง meeting กับ provider และรับ join_url + meeting_id
    let join_url = '';
    let start_url = '';
    let meeting_id = '';

    if (platform === 'Zoom') {
      const z = await createZoomMeeting({ topic: title, start_time, duration: Number(duration), timezone: 'Asia/Bangkok', agenda: description });
      join_url    = z.join_url;
      start_url   = z.start_url;
      meeting_id  = z.meeting_id;

    } else if (platform === 'Google Meet') {
      const g = await createGoogleMeeting(title, start_time, end_time, description, token);
      join_url   = g.join_url;
      meeting_id = g.event_id;

    } else if (platform === 'Microsoft Teams') {
      const t = await createTeamsMeeting(title, start_time, end_time, description, token);
      join_url   = t.join_url;
      meeting_id = t.meeting_id;

    } else if (platform === 'Webex') {
      const w = await createWebexMeeting(title, start_time, Number(duration), description);
      join_url   = w.join_url;
      meeting_id = w.meeting_id;
    }

    // บันทึกลงฐานข้อมูล meetings
    await db.query(
      `INSERT INTO meetings
         (id, title, description, start_time, end_time, duration, platform, frequency, reminder, join_url, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [meeting_id, title, description, start_time, end_time, duration, platform, frequency, reminder, join_url, user_id]
    );

    // บันทึก participants (ถ้ามี)
    if (participants.length) {
      await Promise.all(
        participants.map(email =>
          db.query(
            `INSERT INTO meeting_participants (meeting_id, participant_email)
             VALUES (?, ?)`,
            [meeting_id, email]
          )
        )
      );
    }

    // ดึงข้อมูล meeting กลับมา พร้อม participants
    const [[meeting]] = await db.query(
      `SELECT m.*, GROUP_CONCAT(mp.participant_email) AS participant_list
       FROM meetings m
       LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
       WHERE m.id = ?
       GROUP BY m.id`,
      [meeting_id]
    );
    meeting.participants = meeting.participant_list
      ? meeting.participant_list.split(',')
      : [];

    return res.status(201).json(meeting);

  } catch (error) {
    console.error('Create Meeting Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 READ
export const listMeetings = async (req, res) => {
  try {
    const { userId, participantEmail } = req.query;

    const [meetings] = await db.query(
      `SELECT m.* 
       FROM meetings m
       LEFT JOIN meeting_participants mp
         ON m.id = mp.meeting_id
       WHERE m.user_id = ? OR mp.participant_email = ?
       ORDER BY m.start_time ASC`,
      [ userId, participantEmail ]       // <-- ต้องมี 2 ค่า ให้ตรงกับ 2 เครื่องหมาย '?'
    );

    return res.status(200).json(meetings);
  } catch (error) {
    console.error('List Meeting Error:', error);
    return res.status(500).json({ error: 'Failed to fetch meetings: ' + error.message });
  }
};

// 🔹 UPDATE
export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      start_time,
      duration,
      platform,
      frequency,
      reminder,
      participants = []
    } = req.body;

    // คำนวณ end_time ใหม่
    const end_time = new Date(new Date(start_time).getTime() + Number(duration) * 60000).toISOString();

    // อัปเดตตาราง meetings
    await db.query(
      `UPDATE meetings
         SET title       = ?,
             description = ?,
             start_time  = ?,
             end_time    = ?,
             duration    = ?,
             platform    = ?,
             frequency   = ?,
             reminder    = ?
       WHERE id = ?`,
      [title, description, start_time, end_time, duration, platform, frequency, reminder, id]
    );

    // ซิงก์ participants ใหม่
    await db.query(`DELETE FROM meeting_participants WHERE meeting_id = ?`, [id]);
    if (participants.length) {
      await Promise.all(
        participants.map(email =>
          db.query(
            `INSERT INTO meeting_participants (meeting_id, participant_email)
             VALUES (?, ?)`,
            [id, email]
          )
        )
      );
    }

    // ดึงข้อมูล meeting ที่อัปเดตกลับมา
    const [[meeting]] = await db.query(
      `SELECT m.*, GROUP_CONCAT(mp.participant_email) AS participant_list
       FROM meetings m
       LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
       WHERE m.id = ?
       GROUP BY m.id`,
      [id]
    );
    meeting.participants = meeting.participant_list
      ? meeting.participant_list.split(',')
      : [];

    return res.status(200).json(meeting);

  } catch (error) {
    console.error('Update Meeting Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 DELETE
export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM meetings WHERE id = ?`, [id]);
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete Meeting Error:', error);
    res.status(500).json({ error: 'Failed to delete meeting: ' + error.message });
  }
};