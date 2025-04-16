// src/routes/meetingRoutes.js
import express from "express";

const router = express.Router();
import { 
  redirectToZoom,
  handleZoomCallback,
  createZoomMeeting,
  getAllMeetings,
  deleteMeetingById,
  updateMeetingById
} from "../controllers/meetingsController.js"; // ✅ แก้ path ตรงนี้

router.get('/auth', redirectToZoom);
router.get('/zoom/callback', handleZoomCallback);
router.post('/meeting', createZoomMeeting);

// ✅ เพิ่ม endpoint สำหรับ list / delete / update
router.get('/meetings', getAllMeetings);
router.delete('/meetings/:id', deleteMeetingById);
router.patch('/meetings/:id', updateMeetingById);

export default router;
