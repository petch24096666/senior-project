import db from "../config/database.js";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const saltRounds = 10;

// สมัครสมาชิก
export const registerUser = (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Error encrypting password" });
    }

    const values = [fullname, email, hashedPassword];
    db.query(User.registerUser, values, (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).json({ success: false, error: "Database insert error" });
      }
      res.status(201).json({ success: true, message: "User registered successfully" });
    });
  });
};

// เข้าสู่ระบบ
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  db.query(User.getUserByEmail, [email], (err, result) => {
    if (err) {
      console.error("Error retrieving user:", err);
      return res.status(500).json({ success: false, error: "Database query error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        return res.status(500).json({ success: false, error: "Error comparing password" });
      }

      if (match) {
        res.status(200).json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, error: "Incorrect password" });
      }
    });
  });
};
