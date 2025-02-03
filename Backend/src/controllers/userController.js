import db from "../config/database.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js"; // ✅ ใช้ Model ที่ import มา

dotenv.config();

const saltRounds = 10; // ✅ ใช้ค่า salt rounds ที่ปลอดภัย

// ✅ สมัครสมาชิก
export const registerUser = async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // ✅ ตรวจสอบว่ามี email นี้อยู่แล้วหรือไม่
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    // ✅ เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [fullname, email, hashedPassword]);

    if (result.affectedRows === 1) {
      res.status(201).json({ success: true, message: "User registered successfully" });
    } else {
      res.status(500).json({ success: false, error: "User registration failed" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ✅ เข้าสู่ระบบ
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received:", req.body);

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // ✅ ใช้ SQL จาก userModel.js
    const [rows] = await db.query(User.loginUser, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = rows[0];

    try {
      // ✅ ตรวจสอบรหัสผ่าน
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, error: "Incorrect password" });
      }
    } catch (bcryptError) {
      console.error("Error comparing password:", bcryptError);
      return res.status(500).json({ success: false, error: "Error verifying password" });
    }

    // ✅ ส่งข้อมูลผู้ใช้กลับไป
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ✅ ฟังก์ชัน Logout
export const logoutUser = (req, res) => {
  res.status(200).json({ success: true, message: "Logout successful" });
};
