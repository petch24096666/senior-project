// models/bookedModel.js
import db from "../config/database.js";

export const createBookedModel = async (data) => {
  const {
    booked_id,
    booked_startdate,
    booked_enddate,
    booked_starttime,
    booked_endtime,
    booking_id,
    user_id
  } = data;

  const sql = `
    INSERT INTO booked (
      booked_id,
      booked_startdate,
      booked_enddate,
      booked_starttime,
      booked_endtime,
      booking_id,
      user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    booked_id,
    booked_startdate,
    booked_enddate,
    booked_starttime,
    booked_endtime,
    booking_id,
    user_id
  ];

  const [result] = await db.execute(sql, values);
  return result;
};

export const getBookedTimesModel = async (booking_id, date) => {
    const sql = `
      SELECT booked_starttime, booked_endtime
      FROM booked
      WHERE booking_id = ? AND booked_startdate <= ? AND booked_enddate >= ?
    `;
    const [rows] = await db.execute(sql, [booking_id, date, date]);
    return rows;
};
