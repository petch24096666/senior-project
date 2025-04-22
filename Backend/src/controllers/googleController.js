// controllers/googleController.js
import { google } from 'googleapis';
import db from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const redirectToGoogle = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  res.redirect(url);
};

export const handleGoogleCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const email = data.email;

    await db.query(
      `UPDATE users SET google_token = ?, google_refresh_token = ?, provider = 'google' WHERE email = ?`,
      [tokens.access_token, tokens.refresh_token, email]
    );

    res.send('<h3 style="color:green">✅ Google Meet connected and token saved</h3>');
  } catch (err) {
    console.error('❌ Google callback error:', err);
    res.status(500).send('Google authentication failed');
  }
};

export const createGoogleMeet = async ({ user_id, title, date, time, duration }) => {
  const [[user]] = await db.query("SELECT google_token, google_refresh_token FROM users WHERE user_id = ?", [user_id]);

  if (!user?.google_token) throw new Error("Google not authenticated.");

  oauth2Client.setCredentials({
    access_token: user.google_token,
    refresh_token: user.google_refresh_token
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const eventStart = new Date(`${date}T${time}:00`).toISOString();
  const eventEnd = new Date(new Date(eventStart).getTime() + duration * 60000).toISOString();

  const event = {
    summary: title,
    description: 'Created via app integration',
    start: { dateTime: eventStart, timeZone: 'Asia/Bangkok' },
    end: { dateTime: eventEnd, timeZone: 'Asia/Bangkok' },
    conferenceData: { createRequest: { requestId: user_id, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
  };

  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
  });

  return data.hangoutLink;
};