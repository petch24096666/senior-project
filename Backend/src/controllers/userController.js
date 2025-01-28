import db from "../config/database.js";
import bycrypt from "bcrypt";
import User from "../models/userModel.js";

const salt = 5;

// สมัครสมาชิก 
export const registerUser = (req, res) => {
  const sql = User.registerUser;
  bycrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json("Error");
    const values = [req.body.fullname, req.body.email, hash];
    db.query(sql, [values], (err, result) => {
      if (err) console.log(err);
      else return res.json(result);
    });
  });
};

// เข้าสู่ระบบ
export const loginUser = (req, res) => {
  const sql = User.loginUser;
  db.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ Error: "Database error" });
    else {
      if(result.length > 0) {
        bycrypt.compare(req.body.password.toString(), result[0].password, (err, response) => {
          if (err) return res.json({ Error: "Error comparing password" });
          if (response) return res.json({ Status: "Success" });
          else return res.json({ Error: "Wrong password" });
        });
      }else {
        return res.json({ Error: "Email not existing" });
      }
    }
  })
}