import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/userController.js"; // ✅ Import logoutUser

const router = express.Router();

// ✅ API สมัครสมาชิก
router.post("/api/register", registerUser);

// ✅ API เข้าสู่ระบบ
router.post("/api/login", loginUser);

// ✅ API ออกจากระบบ
router.post("/api/logout", logoutUser);

export default router;
