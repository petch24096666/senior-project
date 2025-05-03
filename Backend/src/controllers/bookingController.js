import path from "path";
import db from '../config/database.js';
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import {
  createBookingModel,
  getAllBookingModel,
  getBookingByIdModel,
  updateBookingModel,
  deleteBookingModel,
} from "../models/bookingModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const {
      booking_id,
      booking_title,
      booking_description,
      booking_type,
      creator_id
    } = req.body;

    let booking_image = null;

    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const filename = `${uuidv4()}${fileExt}`;
      const savePath = path.join(__dirname, "../uploads", filename);
      fs.writeFileSync(savePath, req.file.buffer);
      booking_image = filename;
    }

    const booking_status = "Available";

    const bookingData = {
      booking_id,
      booking_title,
      booking_description,
      booking_type,
      booking_image,
      booking_status,
      creator_id
    };

    const result = await createBookingModel(bookingData);

    res.status(201).json({ success: true, message: "Booking created", result });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// UPDATE BOOKING
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_title,
      booking_description,
      booking_type,
      booking_status
    } = req.body;

    const existingBooking = await getBookingByIdModel(id);
    let booking_image = existingBooking.booking_image;

    if (req.file && req.file.originalname) {
      if (booking_image) {
        const oldImagePath = path.join(__dirname, "../uploads", booking_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const fileExt = path.extname(req.file.originalname);
      const filename = `${uuidv4()}${fileExt}`;
      const savePath = path.join(__dirname, "../uploads", filename);

      fs.writeFileSync(savePath, req.file.buffer);
      booking_image = filename;
    }

    const updated = await updateBookingModel(id, {
      booking_title,
      booking_description,
      booking_type,
      booking_status,
      booking_image
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE BOOKING
export const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่า booking มีอยู่จริง
    const [bookingRows] = await db.query("SELECT * FROM booking WHERE booking_id = ?", [id]);
    if (bookingRows.length === 0) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // ลบข้อมูลจาก booked ที่ booking_id ตรงกัน
    await db.query("DELETE FROM booked WHERE booking_id = ?", [id]);

    // ลบ booking หลัก
    await db.query("DELETE FROM booking WHERE booking_id = ?", [id]);

    res.status(200).json({ success: true, message: "Booking and related bookings deleted successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getAllBooking = async (req, res) => {
  try {
    const data = await getAllBookingModel();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getBookingByIdModel(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
