import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ตั้งค่า OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 🔹 Route สำหรับดึง Google Calendar Events
router.get("/google-events", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Missing access token" });

    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items.map(event => ({
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      color: "#4285F4", // Google Blue
    }));

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
