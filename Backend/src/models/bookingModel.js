import db from "../config/database.js";

export const createBookingModel = async (bookingData) => {
  const {
    booking_id,
    booking_image,
    booking_title,
    booking_description,
    booking_type,
    booking_status,
    creator_id
  } = bookingData;

  const sql = `
    INSERT INTO booking (
      booking_id,
      booking_title,
      booking_image,
      booking_description,
      booking_type,
      booking_status,
      creator_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    booking_id,
    booking_title,
    booking_image,
    booking_description,
    booking_type,
    booking_status,
    creator_id
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
      booking_status = ?
    WHERE booking_id = ?
  `;

  const values = [
    data.booking_image,
    data.booking_title,
    data.booking_description,
    data.booking_type,
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