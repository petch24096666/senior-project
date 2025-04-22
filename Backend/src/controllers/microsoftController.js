// controllers/microsoftController.js
import axios from 'axios';
import db from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const client_id = process.env.MICROSOFT_CLIENT_ID;
const client_secret = process.env.MICROSOFT_CLIENT_SECRET;
const redirect_uri = process.env.MICROSOFT_REDIRECT_URI;

export const redirectToMicrosoft = (req, res) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&response_mode=query&scope=User.Read%20OnlineMeetings.ReadWrite`;
  res.redirect(url);
};

export const handleMicrosoftCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', new URLSearchParams({
      client_id,
      scope: 'User.Read OnlineMeetings.ReadWrite',
      code,
      redirect_uri,
      grant_type: 'authorization_code',
      client_secret
    }));

    const { access_token, refresh_token } = response.data;
    const profile = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const email = profile.data.userPrincipalName;

    await db.query(`UPDATE users SET microsoft_token = ?, microsoft_refresh_token = ?, provider = 'microsoft' WHERE email = ?`, [access_token, refresh_token, email]);

    res.send('<h3 style="color:green">✅ Microsoft Teams connected and token saved</h3>');
  } catch (err) {
    console.error('❌ Microsoft callback error:', err);
    res.status(500).send('Microsoft authentication failed');
  }
};

export const createMicrosoftTeamsMeeting = async ({ user_id, title, date, time, duration }) => {
  const [[user]] = await db.query("SELECT microsoft_token, microsoft_refresh_token FROM users WHERE user_id = ?", [user_id]);
  if (!user?.microsoft_token) throw new Error("Microsoft not authenticated.");

  let accessToken = user.microsoft_token;

  const createMeeting = async (token) => {
    const startDateTime = new Date(`${date}T${time}:00`).toISOString();
    const endDateTime = new Date(new Date(startDateTime).getTime() + duration * 60000).toISOString();

    const payload = {
      subject: title,
      startDateTime,
      endDateTime,
      participants: [],
      isEntryExitAnnounced: false
    };

    const response = await axios.post('https://graph.microsoft.com/v1.0/me/onlineMeetings', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  try {
    const result = await createMeeting(accessToken);
    return result.joinUrl;
  } catch (error) {
    if (error.response?.status === 401) {
      const refresh = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', new URLSearchParams({
        client_id,
        grant_type: 'refresh_token',
        refresh_token: user.microsoft_refresh_token,
        redirect_uri,
        client_secret,
        scope: 'User.Read OnlineMeetings.ReadWrite'
      }));

      accessToken = refresh.data.access_token;

      await db.query("UPDATE users SET microsoft_token = ?, microsoft_refresh_token = ? WHERE user_id = ?", [accessToken, refresh.data.refresh_token, user_id]);

      const result = await createMeeting(accessToken);
      return result.joinUrl;
    } else {
      console.error('❌ Microsoft Teams API error:', error);
      throw new Error('Microsoft Teams API error');
    }
  }
};
