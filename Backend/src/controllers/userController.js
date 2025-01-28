import db from "../config/database.js";
import bcrypt from "bcrypt"; // 🔹 แก้ไขชื่อ (bycrypt -> bcrypt)
import User from "../models/userModel.js";

// ✅ ตั้งค่า Salt สำหรับการเข้ารหัสรหัสผ่าน
const salt = 5;

// ✅ สมัครสมาชิก
export const registerUser = (req, res) => {
  const sql = User.registerUser;
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json("Error");
    const values = [req.body.fullname, req.body.email, hash];
    db.query(sql, [values], (err, result) => {
      if (err) console.log(err);
      else return res.json(result);
    });
  });
};

// ✅ เข้าสู่ระบบ
export const loginUser = (req, res) => {
  const sql = User.loginUser;
  db.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ Error: "Database error" });
    else {
      if (result.length > 0) {
        bcrypt.compare(req.body.password.toString(), result[0].password, (err, response) => {
          if (err) return res.json({ Error: "Error comparing password" });
          if (response) {
            return res.json({ Status: "Success", authToken: "mocked_token" }); // ✅ ส่ง Token กลับไป
          } else {
            return res.json({ Error: "Wrong password" });
          }
        });
      } else {
        return res.json({ Error: "Email not existing" });
      }
    }
  });
};

// ✅ ฟังก์ชัน Logout
export const logoutUser = (req, res) => {
  res.clearCookie("authToken"); // ลบ Cookie Token (ถ้ามี)
  return res.status(200).json({ message: "Logout successful" });
};
