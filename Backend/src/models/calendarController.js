import fetch from "node-fetch";
import axios from "axios";

// ==============================
// GOOGLE CALENDAR CONTROLLERS
// ==============================

export const getGoogleEvents = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(401).json({ error: "Missing Google Token" });

  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Google Events Error:", err);
    res.status(500).json({ error: "Failed to fetch Google Calendar events" });
  }
};

export const createGoogleEvent = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(401).json({ error: "Missing Google Token" });

  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Google Create Event Error:", err);
    res.status(500).json({ error: "Failed to create Google Calendar event" });
  }
};

export const updateGoogleEvent = async (req, res) => {
  const { eventId } = req.params;
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(401).json({ error: "Missing Google Token" });

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body.updatedEvent),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Google Update Error:", err);
    res.status(500).json({ error: "Failed to update Google event" });
  }
};

export const deleteGoogleEvent = async (req, res) => {
  const { eventId } = req.params;
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(401).json({ error: "Missing Google Token" });

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      res.json({ success: true });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Delete failed");
    }
  } catch (err) {
    console.error("❌ Google Delete Error:", err);
    res.status(500).json({ error: "Failed to delete Google event" });
  }
};

// ==============================
// MICROSOFT CALENDAR CONTROLLERS
// ==============================

export const getMicrosoftEvents = async (req, res) => {
  try {
    const result = await axios.get("https://graph.microsoft.com/v1.0/me/events", {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    res.json(result.data);
  } catch (err) {
    console.error("❌ Microsoft Events Error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to fetch Microsoft events" });
  }
};

export const createMicrosoftEvent = async (req, res) => {
  try {
    const result = await axios.post("https://graph.microsoft.com/v1.0/me/events", req.body, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    res.json(result.data);
  } catch (err) {
    console.error("❌ Microsoft Create Error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to create Microsoft event" });
  }
};

export const updateMicrosoftEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await axios.patch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, req.body, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    res.json(result.data);
  } catch (err) {
    console.error("❌ Microsoft Update Error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to update Microsoft event" });
  }
};

export const deleteMicrosoftEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await axios.delete(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      headers: { Authorization: `Bearer ${req.accessToken}` },
    });
    res.status(204).send();
  } catch (err) {
    console.error("❌ Microsoft Delete Error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to delete Microsoft event" });
  }
};