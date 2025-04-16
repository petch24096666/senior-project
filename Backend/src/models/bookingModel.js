// ✅ bookingModel.js (เฉพาะฟิลด์ตาม schema)
import db from "../config/database.js";

export const createBookingModel = async (bookingData) => {
  const {
    booking_id,
    booking_image,
    booking_title,
    booking_description,
    booking_type,
    booking_startdate,
    booking_enddate,
    booking_starttime,
    booking_endtime,
    booking_status
  } = bookingData;

  const sql = `
    INSERT INTO booking (
      booking_id,
      booking_title,
      booking_image,
      booking_description,
      booking_type,
      booking_startdate,
      booking_enddate,
      booking_starttime,
      booking_endtime,
      booking_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    booking_id,
    booking_title,
    booking_image,
    booking_description,
    booking_type,
    booking_startdate,
    booking_enddate,
    booking_starttime,
    booking_endtime,
    booking_status
  ];

  const [result] = await db.execute(sql, values);
  return result;
};

export const getAllBookingModel = async () => {
  const [rows] = await db.query("SELECT * FROM booking");
  return rows;
};

export const getBookingByIdModel = async (id) => {
  const [rows] = await db.query("SELECT * FROM booking WHERE booking_id = ?", [id]);
  return rows[0];
};

export const updateBookingModel = async (id, data) => {
  const sql = `
    UPDATE booking SET
      booking_image = ?,
      booking_title = ?,
      booking_description = ?,
      booking_type = ?,
      booking_startdate = ?,
      booking_enddate = ?,
      booking_starttime = ?,
      booking_endtime = ?,
      booking_status = ?
    WHERE booking_id = ?
  `;

  const values = [
    data.booking_image,
    data.booking_title,
    data.booking_description,
    data.booking_type,
    data.booking_startdate,
    data.booking_enddate,
    data.booking_starttime,
    data.booking_endtime,
    data.booking_status,
    id
  ];

  const [result] = await db.query(sql, values);
  return result;
};

export const deleteBookingModel = async (id) => {
  const [result] = await db.query("DELETE FROM booking WHERE booking_id = ?", [id]);
  return result;
};
