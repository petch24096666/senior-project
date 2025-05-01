// controllers/bookedController.js
import { v4 as uuidv4 } from "uuid";
import { createBookedModel } from "../models/bookedModel.js";
import { getBookedTimesModel } from "../models/bookedModel.js";

export const createBooked = async (req, res) => {
  try {
    const {
      booked_startdate,
      booked_enddate,
      booked_starttime,
      booked_endtime,
      booking_id,
      user_id
    } = req.body;

    const booked_id = uuidv4();

    await createBookedModel({
      booked_id,
      booked_startdate,
      booked_enddate,
      booked_starttime,
      booked_endtime,
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
    try {
      const { booking_id, date } = req.query;
      if (!booking_id || !date) {
        return res.status(400).json({ success: false, error: "Missing booking_id or date" });
      }
  
      const times = await getBookedTimesModel(booking_id, date);
      res.json({ success: true, data: times });
    } catch (error) {
      console.error("Get Booked Times Error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
  
