import axios from 'axios';
import db from '../config/database.js';

// Refresh Google Access Token
export const refreshGoogleToken = async (userId) => {
  const [[user]] = await db.query('SELECT google_refresh_token FROM users WHERE user_id = ?', [userId]);
  if (!user?.google_refresh_token) throw new Error('No Google refresh token available');

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: process.env.GOOGLE_MEETING_CLIENT_ID,
    client_secret: process.env.GOOGLE_MEETING_CLIENT_SECRET,
    refresh_token: user.google_refresh_token,
    grant_type: 'refresh_token'
  });

  const { access_token } = response.data;

  await db.query('UPDATE users SET google_token = ? WHERE user_id = ?', [access_token, userId]);
  return access_token;
};

// Refresh Microsoft Access Token
export const refreshMicrosoftToken = async (userId) => {
  const [[user]] = await db.query('SELECT microsoft_refresh_token FROM users WHERE user_id = ?', [userId]);
  if (!user?.microsoft_refresh_token) throw new Error('No Microsoft refresh token available');

  const params = new URLSearchParams();
  params.append('client_id', process.env.MICROSOFT_MEETING_CLIENT_ID);
  params.append('client_secret', process.env.MICROSOFT_MEETING_CLIENT_SECRET);
  params.append('refresh_token', user.microsoft_refresh_token);
  params.append('grant_type', 'refresh_token');

  const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const { access_token } = response.data;

  await db.query('UPDATE users SET microsoft_token = ? WHERE user_id = ?', [access_token, userId]);
  return access_token;
};

// Refresh Zoom Access Token
export const refreshZoomToken = async (userId) => {
  const [[user]] = await db.query('SELECT zoom_refresh_token FROM users WHERE user_id = ?', [userId]);
  if (!user?.zoom_refresh_token) throw new Error('No Zoom refresh token available');

  const response = await axios.post('https://zoom.us/oauth/token', null, {
    params: {
      grant_type: 'refresh_token',
      refresh_token: user.zoom_refresh_token
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')
    }
  });

  const { access_token } = response.data;

  await db.query('UPDATE users SET zoom_token = ? WHERE user_id = ?', [access_token, userId]);
  return access_token;
};
