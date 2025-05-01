// src/controllers/webexController.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const webexToken = process.env.WEBEX_ACCESS_TOKEN; // ต้องตั้งค่าใน .env ล่วงหน้า

// 🔁 สร้าง Webex Meeting โดยใช้ Webex Personal Access Token
export const createWebexMeeting = async (title, start_time, duration, description) => {
  try {
    const res = await axios.post(
      'https://webexapis.com/v1/meetings',
      {
        title,
        start: start_time,
        durationMinutes: Number(duration),
        agenda: description
      },
      {
        headers: {
          Authorization: `Bearer ${webexToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      join_url: res.data.webLink,
      meeting_id: res.data.id
    };
  } catch (err) {
    console.error('Webex Meeting Error:', err.response?.data || err);
    throw new Error('Failed to create Webex meeting');
  }
};

// Optional (OAuth redirect — ถ้าไม่ได้ใช้ Supabase Auth)
export const redirectToWebexOAuth = (req, res) => {
  const webexOAuthUrl = `https://webexapis.com/v1/authorize?...`;
  res.redirect(webexOAuthUrl);
};

export const handleWebexOAuthCallback = async (req, res) => {
  try {
    res.redirect('http://localhost:5173/profile');
  } catch (error) {
    console.error('Webex OAuth Error:', error.message);
    res.status(500).json({ error: 'Webex OAuth error' });
  }
};
