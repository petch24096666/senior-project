import express from "express";
import { Client } from "@microsoft/microsoft-graph-client";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 🔹 Route สำหรับดึง Microsoft Calendar Events
router.get("/microsoft-events", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Missing access token" });

    const graphClient = Client.init({
      authProvider: (done) => done(null, token),
    });

    const response = await graphClient.api("/me/events").get();
    const events = response.value.map(event => ({
      title: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
      color: "#0078D4", // Microsoft Blue
    }));

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
