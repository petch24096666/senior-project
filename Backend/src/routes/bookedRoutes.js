// routes/bookedRoutes.js
import express from "express";
import { createBooked } from "../controllers/bookedController.js";
import { getBookedTimes } from "../controllers/bookedController.js"; // ✅ เพิ่มบรรทัดนี้

const router = express.Router();

// POST /booked (รับจาก React)
router.post("/booked", createBooked);
router.get("/booked/times", getBookedTimes);

export default router;
