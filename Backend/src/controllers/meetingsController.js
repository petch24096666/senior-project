// src/controllers/meetingsController.js
import db from '../config/database.js';
import { createZoomMeeting } from './zoomController.js';
import { createGoogleMeeting } from './googleController.js';
import { createTeamsMeeting } from './microsoftController.js';
import { createWebexMeeting } from './webexController.js';
import { sendInvitationEmail } from '../services/emailService.js';

// 🔹 CREATE
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      duration,
      platform,
      frequency,
      reminder,
      participants = [],
      user_id,
      token,
      provider
    } = req.body;

    let join_url = '', start_url = '', meeting_id = '';

    if (platform === 'Zoom') {
      try {
        const zoomRes = await createZoomMeeting(
          { body: { topic: title, start_time, duration, timezone: 'Asia/Bangkok', agenda: description } },
          { status: () => ({ json: (d) => d }) }
        );
        join_url = zoomRes.join_url;
        start_url = zoomRes.start_url;
        meeting_id = zoomRes.meeting_id;
      } catch (zoomError) {
        console.error('Error creating Zoom meeting:', zoomError);
        return res.status(500).json({ error: 'Failed to create Zoom meeting: ' + zoomError.message });
      }
    } else if (platform === 'Google Meet') {
      try {
        const googleRes = await createGoogleMeeting(title, start_time, end_time, description, token);
        join_url = googleRes.join_url;
        meeting_id = googleRes.event_id;
      } catch (googleError) {
        console.error('Error creating Google Meet:', googleError);
        return res.status(500).json({ error: 'Failed to create Google Meet: ' + googleError.message });
      }
    } else if (platform === 'Microsoft Teams') {
      try {
        const msRes = await createTeamsMeeting(title, start_time, end_time, description, token);
        join_url = msRes.join_url;
        meeting_id = msRes.meeting_id;
      } catch (msError) {
        console.error('Error creating Microsoft Teams meeting:', msError);
        return res.status(500).json({ error: 'Failed to create Microsoft Teams meeting: ' + msError.message });
      }
    } else if (platform === 'Webex') {
      try {
        const webexRes = await createWebexMeeting(title, start_time, duration, description);
        join_url = webexRes.join_url;
        meeting_id = webexRes.meeting_id;
      } catch (webexError) {
        console.error('Error creating Webex meeting:', webexError);
        return res.status(500).json({ error: 'Failed to create Webex meeting: ' + webexError.message });
      }
    }

    await db.query(
      `INSERT INTO meetings
        (id, title, description, start_time, end_time, duration, platform, frequency, reminder, join_url, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [meeting_id, title, description, start_time, end_time, duration, platform, frequency, reminder, join_url, user_id] // <-- เพิ่ม meeting_id ตรงนี้
    );

    if (participants.length > 0) {
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

    return res.status(201).json({ message: 'Meeting created successfully', meeting_id, join_url, start_url });

  } catch (error) {
    console.error('Create Meeting Error:', error);
    return res.status(500).json({ error: 'Failed to create meeting: ' + error.message });
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
    const { title, description, start_time, end_time } = req.body;

    await db.query(
      `UPDATE meetings SET title = ?, description = ?, start_time = ?, end_time = ? WHERE id = ?`,
      [title, description, start_time, end_time, id]
    );

    res.status(200).json({ message: 'Meeting updated successfully' });
  } catch (error) {
    console.error('Update Meeting Error:', error);
    res.status(500).json({ error: 'Failed to update meeting: ' + error.message });
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