import express from "express";
import { registerUser, loginUser, logoutUser, oauthLoginUser, updateUser} from "../controllers/userController.js"; // ✅ เพิ่ม oauthLoginUser

const router = express.Router();

// ✅ API สมัครสมาชิก
router.post("/api/register", registerUser);

// ✅ API เข้าสู่ระบบ
router.post("/api/login", loginUser);

// ✅ API ออกจากระบบ
router.post("/api/logout", logoutUser);

// ✅ API เข้าสู่ระบบผ่าน OAuth
router.post("/api/oauth-login", oauthLoginUser);

router.put("/update-user", updateUser); // อัพเดตข้อมูลผู้ใช้

export default router;
