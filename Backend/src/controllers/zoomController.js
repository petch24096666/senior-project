// src/controllers/zoomController.js
import axios from 'axios';

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

    accessToken = response.data.access_token;

    res.send('✅ Zoom connected successfully');
  } catch (err) {
    console.error('Zoom auth error:', err.response.data);
    res.status(500).send('Zoom authentication failed');
  }
};

export const createZoomMeeting = async (req, res) => {
  const { title, date, time, duration } = req.body;
  const startTime = new Date(`${date}T${time}:00`).toISOString();

  try {
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
    console.error('Create meeting failed:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create Zoom meeting' });
  }
};
