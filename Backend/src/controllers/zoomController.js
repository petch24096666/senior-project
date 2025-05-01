// src/controllers/zoomController.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.ZOOM_CLIENT_ID;
const clientSecret = process.env.ZOOM_CLIENT_SECRET;
const accountId = process.env.ZOOM_ACCOUNT_ID;

let zoomAccessToken = null;

// 🔐 ขอ Access Token จาก Zoom (S2S OAuth)
export const getZoomAccessToken = async () => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'account_credentials',
        account_id: accountId,
      },
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    zoomAccessToken = response.data.access_token;
    console.log('Zoom Access Token:', zoomAccessToken); // Log token
    return zoomAccessToken;
  } catch (error) {
    console.error('Failed to get Zoom access token:', error.response?.data || error.message);
    zoomAccessToken = null; // Reset token on error
    throw error;
  }
};

// ✅ สร้าง Zoom Meeting (ใช้ได้ทั้งภายใน controller หรือแยก direct endpoint)
export const createZoomMeeting = async (req, res) => {
  try {
    if (!zoomAccessToken) {
      console.log('Getting new Zoom access token...');
      await getZoomAccessToken();
      if (!zoomAccessToken) {
        throw new Error('Failed to obtain Zoom access token');
      }
    }

    const payload = req.body || req;
    console.log('Zoom API Payload:', payload); // Log payload

    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic: payload.topic,
      type: 2,
      start_time: payload.start_time,
      duration: payload.duration,
      timezone: payload.timezone,
      agenda: payload.agenda,
      settings: {
        host_video: true,
        participant_video: true,
      },
    }, {
      headers: {
        Authorization: `Bearer ${zoomAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = {
      join_url: response.data.join_url,
      start_url: response.data.start_url,
      meeting_id: response.data.id,
    };

    console.log('Zoom API Response:', result); // Log response

    if (res && res.status) return res.status(200).json(result);
    return result;

  } catch (error) {
    console.error('Failed to create Zoom meeting:', error.response?.data || error.message);
    zoomAccessToken = null; // Reset token on error
    throw error;
  }
};