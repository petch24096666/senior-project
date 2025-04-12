// src/routes/zoomAuth.js
import express from "express";

const router = express.Router();
import { 
  redirectToZoom,
  handleZoomCallback,
  createZoomMeeting
} from "../controllers/zoomController.js";

router.get('/auth', redirectToZoom);
router.get('/callback', handleZoomCallback);
router.post('/meeting', createZoomMeeting);

export default router;
