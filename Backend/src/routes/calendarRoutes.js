import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/google-events", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Token is missing" });
    }

    const googleResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("❌ Google API Error:", data);
      return res.status(googleResponse.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching from Google API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-google-event/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        const updatedEvent = req.body.updatedEvent;
        const googleToken = req.headers.authorization?.split("Bearer ")[1];

        console.log("🔍 Received Google Token:", googleToken);
        console.log("📌 Updating Event ID:", eventId);
        console.log("📄 Event Data to Update:", updatedEvent);

        if (!googleToken) {
            return res.status(401).json({ error: "Unauthorized: Missing Google Token" });
        }

        const googleApiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

        const response = await fetch(googleApiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${googleToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedEvent),
        });

        if (!response.ok) {
            throw new Error(`Google API Error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Google Calendar Update Error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete("/delete-google-event/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        const googleToken = req.headers.authorization?.split("Bearer ")[1];

        console.log("🗑️ Deleting Google Calendar Event ID:", eventId);
        console.log("🔍 Received Google Token:", googleToken);

        if (!googleToken) {
            return res.status(401).json({ error: "Unauthorized: Missing Google Token" });
        }

        const googleApiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

        const response = await fetch(googleApiUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${googleToken}`,
            },
        });

        if (response.status === 204) {
            res.json({ success: true, message: "Event deleted successfully." });
        } else {
            const errorData = await response.json();
            throw new Error(`Google API Error: ${errorData.error.message}`);
        }
    } catch (error) {
        console.error("❌ Google Calendar Delete Error:", error);
        res.status(500).json({ error: error.message });
    }
});


export default router;
