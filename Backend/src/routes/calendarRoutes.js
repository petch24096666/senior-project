import express from "express";
import {
  getGoogleEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  getMicrosoftEvents,
  createMicrosoftEvent,
  updateMicrosoftEvent,
  deleteMicrosoftEvent,
} from "../controllers/calendarController.js";

const router = express.Router();

// =====================
// GOOGLE ROUTES
// =====================
router.get("/google-events", getGoogleEvents);
router.post("/create-google-event", createGoogleEvent);
router.put("/update-google-event/:eventId", updateGoogleEvent);
router.delete("/delete-google-event/:eventId", deleteGoogleEvent);

// =====================
// MICROSOFT ROUTES
// =====================
const verifyMicrosoftToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  req.accessToken = authHeader.split(" ")[1];
  next();
};

router.get("/microsoft-events", verifyMicrosoftToken, getMicrosoftEvents);
router.post("/create-microsoft-event", verifyMicrosoftToken, createMicrosoftEvent);
router.put("/update-microsoft-event/:eventId", verifyMicrosoftToken, updateMicrosoftEvent);
router.delete("/delete-microsoft-event/:eventId", verifyMicrosoftToken, deleteMicrosoftEvent);

export default router;