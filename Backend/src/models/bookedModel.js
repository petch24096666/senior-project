import db from "../config/database.js";

export const createBookedModel = async (data) => {
  const {
    booked_id,
    booked_date,
    booked_time,
    booking_id,
    user_id
  } = data;

  const sql = `
    INSERT INTO booked (
      booked_id,
      booked_date,
      booked_time,
      booking_id,
      user_id
    ) VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    booked_id,
    booked_date,
    booked_time,
    booking_id,
    user_id
  ];

  const [result] = await db.execute(sql, values);
  return result;
};

export const getBookedTimesModel = async (booking_id, booked_date) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(booked_time, '%H:%i') AS booked_time 
       FROM booked 
       WHERE booking_id = ? AND booked_date = ?`,
      [booking_id, booked_date]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};