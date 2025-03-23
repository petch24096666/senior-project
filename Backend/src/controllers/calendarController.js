import { supabase } from "../config/supabaseClient.js";
import fetch from "node-fetch";

// 📌 ดึงอีเวนต์จาก Google Calendar API
export const getGoogleEvents = async (req, res) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const events = await response.json();
    res.json(events);
  } catch (error) {
    console.error("Google API Error:", error);
    res.status(500).json({ error: "Failed to fetch Google Calendar events" });
  }
};

// 📌 ดึงอีเวนต์จาก Microsoft Calendar API
export const getMicrosoftEvents = async (req, res) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const events = await response.json();
    res.json(events);
  } catch (error) {
    console.error("Microsoft API Error:", error);
    res.status(500).json({ error: "Failed to fetch Microsoft Calendar events" });
  }
};
