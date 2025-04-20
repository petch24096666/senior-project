// routes/meetingRoutes.js
import express from "express";
const router = express.Router();
import {
  redirectToZoom,
  handleZoomCallback,
  createMeeting,
  getAllMeetings,
  updateMeetingById,
  deleteMeetingById,
  getMeetingsByUserId
} from "../controllers/meetingsController.js";

// OAuth Zoom
router.get('/auth', redirectToZoom);
router.get('/zoom/callback', handleZoomCallback);

router.post('/meeting/list', createMeeting);
router.get('/', getMeetingsByUserId);  // Changed to root route with query parameter
router.patch('/meeting/list/:id', updateMeetingById);
router.delete('/meeting/list/:id', deleteMeetingById);

export default router;