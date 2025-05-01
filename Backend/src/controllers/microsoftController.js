// src/controllers/microsoftController.js
import axios from 'axios';

// 🔁 สร้าง Microsoft Teams Meeting โดยใช้ token จาก Supabase Auth
export const createTeamsMeeting = async (title, start_time, end_time, description, accessToken) => {
  try {
    const res = await axios.post(
      'https://graph.microsoft.com/v1.0/me/onlineMeetings',
      {
        subject: title,
        startDateTime: start_time,
        endDateTime: end_time,
        lobbyBypassSettings: {
          isDialInBypassEnabled: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      join_url: res.data.joinWebUrl,
      meeting_id: res.data.id
    };
  } catch (err) {
    console.error('Microsoft Teams Error:', err.response?.data || err);
    throw new Error('Failed to create Microsoft Teams meeting');
  }
};

// Optional (OAuth callback ถ้าไม่ได้ใช้ Supabase)
export const redirectToMicrosoftOAuth = (req, res) => {
  const microsoftOAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...`;
  res.redirect(microsoftOAuthUrl);
};

export const handleMicrosoftOAuthCallback = async (req, res) => {
  try {
    res.redirect('http://localhost:5173/profile');
  } catch (error) {
    console.error('Microsoft OAuth Error:', error.message);
    res.status(500).json({ error: 'Microsoft OAuth error' });
  }
};
