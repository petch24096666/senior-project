import db from '../config/database.js';
import { v4 as uuidv4 } from "uuid";
import { createBookedModel, getBookedTimesModel } from "../models/bookedModel.js";

export const createBooked = async (req, res) => {
  try {
    const {
      booked_date,
      booked_time,
      booking_id,
      user_id
    } = req.body;

    const booked_id = uuidv4();

    await createBookedModel({
      booked_id,
      booked_date,
      booked_time,
      booking_id,
      user_id
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Create Booked Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getBookedTimes = async (req, res) => {
  const { booking_id, date } = req.query;

  try {
    const data = await getBookedTimesModel(booking_id, date);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getBookedByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query(`
      SELECT 
        b.booked_id,
        b.booked_date,
        b.booked_time,
        b.booking_id,
        bk.booking_title,
        bk.booking_description,
        bk.booking_type,
        bk.booking_image
      FROM booked b
      JOIN booking bk ON b.booking_id = bk.booking_id
      WHERE b.user_id = ?
      ORDER BY b.booked_date DESC, b.booked_time ASC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching reservations by user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reservations." });
  }
};

export const deleteBooked = async (req, res) => {
  const bookedId = req.params.bookedId;
  try {
    const [result] = await db.query('DELETE FROM booked WHERE booked_id = ?', [bookedId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ success: false, error: "Failed to delete reservation." });
  }
};

export const getBookedByBookingId = async (req, res) => {
  const { booking_id } = req.params;

  try {
    const [bookingRows] = await db.query(
      "SELECT * FROM booking WHERE booking_id = ?",
      [booking_id]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // 👇 เพิ่ม JOIN users เพื่อให้ได้ user_email
    const [bookedList] = await db.query(
      `SELECT 
        b.booked_id, 
        b.booked_date, 
        b.booked_time,
        u.email AS user_email
      FROM booked b
      JOIN users u ON b.user_id = u.user_id  -- <-- แก้จาก u.id เป็น u.user_id
      WHERE b.booking_id = ?`,
      [booking_id]
    );

    res.json(bookedList);
  } catch (err) {
    console.error("Error in getBookedByBookingId:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};