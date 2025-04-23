// routes/meetingRoutes.js (อัปเดตใหม่ รองรับ Google + Microsoft + Zoom + CRUD)
import express from 'express';
const router = express.Router();

// ✅ Import Zoom controller
import {
  redirectToZoom,
  handleZoomCallback,
  createMeeting,
  updateMeetingById,
  deleteMeetingById,
  getMeetingsByUserId
} from '../controllers/meetingsController.js';

// ✅ Import Google controller
import {
  redirectToGoogle,
  handleGoogleCallback
} from '../controllers/googleController.js';

// ✅ Import Microsoft controller
import {
  redirectToMicrosoft,
  handleMicrosoftCallback
} from '../controllers/microsoftController.js';

// ✅ Zoom OAuth
router.get('/auth/zoom', redirectToZoom);
router.get('/auth/zoom/callback', handleZoomCallback);

// ✅ Google OAuth
router.get('/auth/google', redirectToGoogle);
router.get('/auth/google/callback', handleGoogleCallback);

// ✅ Microsoft OAuth
router.get('/auth/microsoft', redirectToMicrosoft);
router.get('/auth/microsoft/callback', handleMicrosoftCallback);

// ✅ Meeting APIs
router.post('/meeting', createMeeting);
router.patch('/api/:id', updateMeetingById);
router.delete('/api/:id', deleteMeetingById);
router.get('/meetings/:userId', getMeetingsByUserId);


export default router;
