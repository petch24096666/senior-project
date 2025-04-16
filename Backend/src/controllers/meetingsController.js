// src/controllers/zoomController.js
import axios from 'axios';
import db from '../config/database.js';

let accessToken = ''; // NOTE: ใน production ควรเก็บแบบปลอดภัย

export const redirectToZoom = (req, res) => {
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URI}`;
  res.redirect(authUrl);
};

export const handleZoomCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI,
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      }
    });

    const accessToken = response.data.access_token;
    const userInfo = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const email = userInfo.data.email;

    // ✅ อัปเดต token ลงใน users table
    await db.query("UPDATE users SET token = ?, provider = 'zoom' WHERE email = ?", [accessToken, email]);

    res.send('<h3 style="color:green">✅ Zoom connected and token saved successfully</h3>');
  } catch (err) {
    console.error('Zoom auth error:', err.response?.data || err.message);
    res.status(500).send('Zoom authentication failed');
  }
};

export const createZoomMeeting = async (req, res) => {
  const { user_id, title, date, time, duration } = req.body;
  const startTime = new Date(`${date}T${time}:00`).toISOString();

  try {
    // ✅ ดึง token จาก users table
    const [[user]] = await db.query("SELECT token FROM users WHERE user_id = ?", [user_id]);
    if (!user || !user.token) {
      return res.status(401).json({ error: 'Access token not found for this user' });
    }

    const accessToken = user.token;

    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic: title,
      type: 2,
      start_time: startTime,
      duration: parseInt(duration),
      timezone: 'Asia/Bangkok'
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json({ meetingLink: response.data.join_url });
  } catch (err) {
    console.error('🔥 Create meeting failed:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create Zoom meeting' });
  }
};


// ⬇ เพิ่มโค้ดนี้ไว้ด้านล่างสุดใน meetingsController.js

export const getAllMeetings = async (req, res) => {
  const { userId } = req.query;
  const mockMeetings = [
    { id: '123', title: 'Team Sync', date: '2025-04-17', time: '10:00', duration: '60' },
    { id: '456', title: 'Client Demo', date: '2025-04-18', time: '14:00', duration: '45' }
  ];
  return res.json(mockMeetings);
};

export const deleteMeetingById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`https://api.zoom.us/v2/meetings/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return res.json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

export const updateMeetingById = async (req, res) => {
  const { id } = req.params;
  const { title, date, time, duration } = req.body;
  const startTime = new Date(`${date}T${time}:00`).toISOString();
  try {
    const response = await axios.patch(
      `https://api.zoom.us/v2/meetings/${id}`,
      {
        topic: title,
        start_time: startTime,
        duration: parseInt(duration),
        timezone: 'Asia/Bangkok'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return res.json({ message: 'Meeting updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update meeting' });
  }
};
