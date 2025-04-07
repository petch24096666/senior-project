import express from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  oauthLoginUser, 
  updateUser, 
  getUserByEmail,
  setUserPassword  // Add this new import
} from "../controllers/userController.js";

const router = express.Router();

// Existing routes
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);
router.post("/api/logout", logoutUser);
router.post("/api/oauth-login", oauthLoginUser);
router.put("/api/update-user", updateUser);
router.get("/api/users", getUserByEmail);

// Add the new route for setting passwords
router.post("/api/set-password", setUserPassword);

export default router;