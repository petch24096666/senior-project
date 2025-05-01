// src/routes/meetingRoute.js

import express from 'express';

import {
  createMeeting,
  listMeetings,
  updateMeeting,
  deleteMeeting
} from '../controllers/meetingsController.js';

import {
  createZoomMeeting,
  getZoomAccessToken
} from '../controllers/zoomController.js';

import {
  createGoogleMeeting,
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback
} from '../controllers/googleController.js';

import {
  createTeamsMeeting,
  redirectToMicrosoftOAuth,
  handleMicrosoftOAuthCallback
} from '../controllers/microsoftController.js';

import {
  createWebexMeeting,
  redirectToWebexOAuth,
  handleWebexOAuthCallback
} from '../controllers/webexController.js';

const router = express.Router();

// 🔁 CRUD routes — เส้นทางเดียว /meeting
router.post('/', createMeeting);
router.get('/', listMeetings);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

// 🔐 OAuth callback routes
router.get('/oauth/google', redirectToGoogleOAuth);
router.get('/oauth/google/callback', handleGoogleOAuthCallback);
router.get('/oauth/microsoft', redirectToMicrosoftOAuth);
router.get('/oauth/microsoft/callback', handleMicrosoftOAuthCallback);
router.get('/oauth/webex', redirectToWebexOAuth);
router.get('/oauth/webex/callback', handleWebexOAuthCallback);

// 🧪 Optional: ทดสอบสร้าง Zoom โดยตรง
router.post('/zoom/direct', createZoomMeeting);

export default router;
