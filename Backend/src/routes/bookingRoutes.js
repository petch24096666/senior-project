// ✅ bookingRoutes.js (แก้ให้ถูกต้อง)
import express from "express";
import multer from "multer";
import {
  createBooking,
  getAllBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus
} from "../controllers/bookingController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ ลบ /api ออกให้ใช้ path ตรงๆ
router.post("/booking", upload.single("booking_image"), createBooking);
router.get("/booking", getAllBooking);
router.get("/booking/:id", getBookingById);
router.put("/booking/:id", upload.single("booking_image"), updateBooking);
router.delete("/booking/:id", deleteBooking);
router.patch("/booking/status/:id", updateBookingStatus);

export default router;
