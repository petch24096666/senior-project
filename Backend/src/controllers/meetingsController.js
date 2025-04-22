// src/controllers/zoomController.js
import axios from 'axios';
import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { createGoogleMeet } from './googleController.js';
import { createMicrosoftTeamsMeeting } from './microsoftController.js';


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
        redirect_uri: process.env.ZOOM_REDIRECT_URI
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET
      }
    });

    const { access_token, refresh_token } = response.data;
    const userInfo = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const email = userInfo.data.email;

    await db.query(`UPDATE users SET token = ?, refresh_token = ?, provider = 'zoom' WHERE email = ?`, [access_token, refresh_token, email]);
    res.send('<h3 style="color:green">✅ Zoom connected and token saved successfully</h3>');
  } catch (err) {
    console.error('Zoom callback error:', err.response?.data || err.message);
    res.status(500).send('Zoom authentication failed');
  }
};

export const createMeeting = async (req, res) => {
  const { user_id, title, date, time, duration, platform } = req.body;

  try {
    let join_url = '';
    let meetingId = uuidv4();
    const cleanPlatform = platform?.toLowerCase();

    if (cleanPlatform === 'zoom') {
      const [[user]] = await db.query('SELECT token, refresh_token FROM users WHERE user_id = ?', [user_id]);
      if (!user?.token) return res.status(401).json({ error: 'Zoom not authenticated.' });

      const createZoomMeeting = async (token) => {
        const payload = {
          topic: title,
          type: 2,
          start_time: new Date(`${date}T${time}:00`).toISOString(),
          duration: parseInt(duration),
          timezone: 'Asia/Bangkok',
          settings: { join_before_host: true, approval_type: 0 }
        };

        const zoomRes = await axios.post('https://api.zoom.us/v2/users/me/meetings', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return zoomRes.data;
      };

      let accessToken = user.token;
      let meeting;
      try {
        meeting = await createZoomMeeting(accessToken);
      } catch (error) {
        if (error.response?.status === 401) {
          const refresh = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
              grant_type: 'refresh_token',
              refresh_token: user.refresh_token
            },
            auth: {
              username: process.env.ZOOM_CLIENT_ID,
              password: process.env.ZOOM_CLIENT_SECRET
            }
          });
          accessToken = refresh.data.access_token;
          await db.query('UPDATE users SET token = ?, refresh_token = ? WHERE user_id = ?', [accessToken, refresh.data.refresh_token, user_id]);
          meeting = await createZoomMeeting(accessToken);
        } else throw error;
      }

      join_url = meeting.join_url;
      meetingId = meeting.id;

    } else if (cleanPlatform === 'google meet') {
      join_url = await createGoogleMeet({ user_id, title, date, time, duration });

    } else if (cleanPlatform === 'microsoft teams') {
      join_url = await createMicrosoftTeamsMeeting({ user_id, title, date, time, duration });

    } else if (cleanPlatform === 'webex') {
      join_url = `https://webex.com/meeting/${meetingId}`;

    } else {
      return res.status(400).json({ error: 'Unknown platform' });
    }

    await db.query(
      `INSERT INTO meetings (id, user_id, title, date, time, duration, platform, join_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [meetingId, user_id, title, date, time, parseInt(duration), platform, join_url]
    );

    res.json({ meetingLink: join_url });
  } catch (err) {
    console.error('❌ Failed to create meeting:', err);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

export const getMeetingsByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const [rows] = await db.query('SELECT * FROM meetings WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching meetings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMeetingById = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM meetings WHERE id = ?', [id]);
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete meeting:', err.message);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

export const updateMeetingById = async (req, res) => {
  const { id } = req.params;
  const { title, date, time, duration } = req.body;
  try {
    await db.query('UPDATE meetings SET title = ?, date = ?, time = ?, duration = ? WHERE id = ?', [title, date, time, duration, id]);
    res.status(200).json({ message: 'Meeting updated successfully' });
  } catch (err) {
    console.error('❌ Failed to update meeting:', err.message);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
};
