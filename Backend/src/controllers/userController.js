import db from "../config/database.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js"; // ✅ ใช้ Model ที่ import มา
import { supabase

 } from "../config/supabaseClient.js";
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


// ✅ เข้าสู่ระบบผ่าน OAuth (Google/Azure)
// controllers/userController.js

// ✅ เข้าสู่ระบบผ่าน OAuth (Google/Azure)
export const oauthLoginUser = async (req, res) => {
  try {
    const { email, provider_token, provider } = req.body; // ได้ข้อมูลจาก frontend เช่น email, provider_token (Google หรือ Azure)
    
    // ตรวจสอบว่าผู้ใช้มีในฐานข้อมูลหรือไม่
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length === 0) {
      // หากผู้ใช้ไม่มีในฐานข้อมูล ให้เพิ่มผู้ใช้ใหม่
      const sql = "INSERT INTO users (email, provider, token, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
      const [result] = await db.query(sql, [email, provider, provider_token]);

      if (result.affectedRows === 1) {
        res.status(201).json({ success: true, message: "User registered successfully through OAuth" });
      } else {
        res.status(500).json({ success: false, error: "Failed to register user through OAuth" });
      }
    } else {
      // หากผู้ใช้มีอยู่แล้วในฐานข้อมูลให้ทำการอัพเดต token
      const updateSql = "UPDATE users SET token = ?, provider = ?, updated_at = NOW() WHERE email = ?";
      const [updateResult] = await db.query(updateSql, [provider_token, provider, email]);

      if (updateResult.affectedRows === 1) {
        res.status(200).json({
          success: true,
          message: `User's ${provider} token updated successfully`,
        });
      } else {
        res.status(500).json({ success: false, error: "Failed to update user token" });
      }
    }
  } catch (error) {
    console.error("Error during OAuth login:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { email, provider_token, provider } = req.body;

    // ตรวจสอบว่าผู้ใช้มีในฐานข้อมูลหรือไม่
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // อัพเดต token ของ provider ที่ใช้
    let updateQuery = "";
    let updateParams = [];

    if (provider === "google") {
      updateQuery = "UPDATE users SET google_token = ? WHERE email = ?";
      updateParams = [provider_token, email];
    } else if (provider === "microsoft") {
      updateQuery = "UPDATE users SET microsoft_token = ? WHERE email = ?";
      updateParams = [provider_token, email];
    } else {
      return res.status(400).json({ success: false, error: "Invalid provider" });
    }

    const [result] = await db.query(updateQuery, updateParams);

    if (result.affectedRows === 1) {
      return res.status(200).json({ success: true, message: `User's ${provider} token updated successfully` });
    } else {
      return res.status(500).json({ success: false, error: "Failed to update user token" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};