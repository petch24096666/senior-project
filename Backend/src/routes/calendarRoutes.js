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
router.get('/api/google-events', getGoogleEvents);


// =====================
// MICROSOFT ROUTES
// =====================

router.get('/api/microsoft-events', getMicrosoftEvents);

export default router;