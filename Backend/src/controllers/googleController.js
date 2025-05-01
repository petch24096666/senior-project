// src/controllers/googleController.js
import axios from 'axios';

// 🔁 สร้าง Google Meet โดยใช้ token จาก Supabase Auth
export const createGoogleMeeting = async (title, start_time, end_time, description, accessToken) => {
  try {
    const event = {
      summary: title,
      description,
      start: {
        dateTime: start_time,
        timeZone: 'Asia/Bangkok',
      },
      end: {
        dateTime: end_time,
        timeZone: 'Asia/Bangkok',
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const res = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      join_url: res.data.hangoutLink,
      event_id: res.data.id
    };
  } catch (err) {
    console.error('Google Meeting Error:', err.response?.data || err);
    throw new Error('Failed to create Google Meet');
  }
};

// Optional (หากคุณใช้ OAuth ด้วยตัวเองแทน Supabase)
export const redirectToGoogleOAuth = (req, res) => {
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?...`;
  res.redirect(googleOAuthUrl);
};

export const handleGoogleOAuthCallback = async (req, res) => {
  try {
    res.redirect('http://localhost:5173/profile');
  } catch (error) {
    console.error('Google OAuth Error:', error.message);
    res.status(500).json({ error: 'Google OAuth error' });
  }
};
