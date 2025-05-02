// routes/bookedRoutes.js
import express from "express";
import { createBooked } from "../controllers/bookedController.js";
import { getBookedTimes } from "../controllers/bookedController.js"; // ✅ เพิ่มบรรทัดนี้
import { getBookedByUser } from '../controllers/bookedController.js';
import { deleteBooked } from '../controllers/bookedController.js';
const router = express.Router();

// POST /booked (รับจาก React)
router.post("/booked", createBooked);
router.get("/booked/times", getBookedTimes);
router.get('/booked/user/:userId', getBookedByUser);
router.delete('/booked/:bookedId', deleteBooked); // 👈 เพิ่มบรรทัดนี้


export default router;
