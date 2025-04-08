import db from "../config/database.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import { supabase } from "../config/supabaseClient.js";
dotenv.config();

const saltRounds = 10;

// Register user with Supabase and local database
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    return res.status(200).json(rows); 
    // หรือถ้าต้องการรูปแบบ {success: true, data: [...]} ก็ได้
    // return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    console.log("🔍 REGISTER: Received registration request:", {
      user_id: req.body.user_id,
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password ? "PROVIDED" : "MISSING"
    });

    const { user_id, fullname, email, password } = req.body;
    
    // Basic validation
    if (!user_id || !fullname || !email || !password) {
      console.log("❌ REGISTER: Missing required fields");
      return res.status(400).json({ success: false, error: "All fields are required" });
    }
    
    // Check if email or user_id exists
    console.log("🔍 REGISTER: Checking if email or user_id exists:", email, user_id);
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ? OR user_id = ?",
      [email, user_id]
    );
    if (existingUsers.length > 0) {
      console.log("❌ REGISTER: Email or user_id already exists");
      return res.status(400).json({ success: false, error: "Email or user ID already exists" });
    }
    console.log("✅ REGISTER: Email and user_id are available");
    
    // Hash password
    console.log("🔑 REGISTER: Hashing password");
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("✅ REGISTER: Password hashed, length:", hashedPassword.length);
    
    // Insert user with provided UUID
    console.log("📝 REGISTER: Inserting user into database");
    const insertQuery = `
      INSERT INTO users
        (user_id, fullname, email, password, provider, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, 'email', NOW(), NOW())
    `;
    
    const [result] = await db.query(insertQuery, [
      user_id,
      fullname,
      email,
      hashedPassword
    ]);
    console.log("📊 REGISTER: Database insert result:", result);
    
    if (result.affectedRows !== 1) {
      console.log("❌ REGISTER: Database insert failed");
      return res.status(500).json({ success: false, error: "Failed to create user" });
    }
    
    console.log("✅ REGISTER: User registered successfully");
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        user_id,
        fullname,
        email
      }
    });
  } catch (error) {
    console.error("❌ REGISTER: Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "Registration error: " + error.message
    });
  }
};


// Login using Supabase with local database fallback
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received for email:", email);

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // First attempt to login with Supabase
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If Supabase login successful
    if (!supabaseError && supabaseData?.user) {
      console.log("Supabase authentication successful");
      
      // Check if user exists in local database
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      
      let userId;
      
      if (rows.length === 0) {
        console.log("User not found in local database, creating now");
        // User doesn't exist in local database, create them
        try {
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          const sql = "INSERT INTO users (fullname, email, password, provider, token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
          const [result] = await db.query(sql, [
            supabaseData.user.user_metadata?.fullname || email.split('@')[0], 
            email, 
            hashedPassword, 
            "email", 
            supabaseData.session?.access_token
          ]);
          userId = result.insertId;
          console.log("Created new user in local database with ID:", userId);
        } catch (hashError) {
          console.error("Error creating user in local database:", hashError);
          // Continue anyway since Supabase auth was successful
          userId = null;
        }
      } else {
        // User exists, update their token
        const user = rows[0];
        userId = user.user_id;
        console.log("User found in local database with ID:", userId);
        
        try {
          await db.query(
            "UPDATE users SET token = ?, updated_at = NOW() WHERE email = ?", 
            [supabaseData.session?.access_token, email]
          );
          console.log("Updated user token in local database");
        } catch (updateError) {
          console.error("Error updating token:", updateError);
          // Continue anyway since the authentication was successful
        }
      }

      // Return success with user info
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: userId,
          fullname: supabaseData.user.user_metadata?.fullname,
          email: supabaseData.user.email,
          provider: "email",
        },
      });
    } 
    // If Supabase login fails, try local database as fallback
    else {
      console.log("Supabase login failed, trying local database. Error:", supabaseError);
      
      // Get user from local database
      const [rows] = await db.query(User.loginUser, [email]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const user = rows[0];
      console.log("User found in local database. Checking password...");

      // Verify the user has a password in the database
      if (!user.password) {
        console.error("User has no password in database");
        return res.status(401).json({ success: false, error: "Invalid login method. Try logging in with OAuth instead." });
      }

      try {
        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          console.log("Password verification failed");
          return res.status(401).json({ success: false, error: "Incorrect password" });
        }
        console.log("Password verified successfully");
      } catch (bcryptError) {
        console.error("Error comparing password:", bcryptError);
        return res.status(500).json({ success: false, error: "Error verifying password" });
      }

      // Return success with user info
      return res.status(200).json({
        success: true,
        message: "Login successful (local database)",
        user: {
          id: user.user_id,
          fullname: user.fullname,
          email: user.email,
          provider: "email",
        },
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Log out both from Supabase and clear local session
export const logoutUser = async (req, res) => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Supabase logout error:", error);
    }
    
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// OAuth login (Google/Azure) with Supabase
export const oauthLoginUser = async (req, res) => {
  try {
    const { user_id, email, provider_token, provider } = req.body;
    console.log("OAuth login request:", { user_id, email, provider });
    
    // ตรวจสอบว่ามี user_id, email, provider ครบหรือไม่
    if (!user_id || !email || !provider) {
      return res.status(400).json({ success: false, error: "user_id, email and provider are required" });
    }
    
    // ตรวจสอบว่ามี user_id นี้อยู่ในฐานข้อมูลหรือไม่
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id]
    );

    if (existingUser.length === 0) {
      console.log("OAuth user not found in database, creating new user");
      // สร้างผู้ใช้ใหม่โดยใช้ UUID ที่ส่งมา
      const sql = `
        INSERT INTO users
          (user_id, email, provider, token, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, NOW(), NOW())
      `;
      const [result] = await db.query(sql, [
        user_id,
        email,
        provider,
        provider_token
      ]);

      if (result.affectedRows === 1) {
        console.log("OAuth user created successfully in local database");
        return res.status(201).json({
          success: true,
          message: "User registered successfully through OAuth",
          user: { user_id, email, provider }
        });
      } else {
        console.error("Failed to register OAuth user in database");
        return res.status(500).json({
          success: false,
          error: "Failed to register user through OAuth"
        });
      }
    } else {
      console.log("OAuth user found in database, updating token");
      // อัปเดต token และ provider ตาม UUID ที่มีอยู่
      const updateSql = `
        UPDATE users
        SET token = ?, provider = ?, updated_at = NOW()
        WHERE user_id = ?
      `;
      const [updateResult] = await db.query(updateSql, [
        provider_token,
        provider,
        user_id
      ]);

      if (updateResult.affectedRows === 1) {
        console.log("OAuth user token updated successfully");
        return res.status(200).json({
          success: true,
          message: `User's ${provider} token updated successfully`,
          user: { user_id, email, provider }
        });
      } else {
        console.error("Failed to update OAuth user token");
        return res.status(500).json({
          success: false,
          error: "Failed to update user token"
        });
      }
    }
  } catch (error) {
    console.error("Error during OAuth login:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

// Update user tokens
export const updateUser = async (req, res) => {
  try {
    const { email, provider_token, provider } = req.body;
    console.log("Update user request:", { email, provider });

    // Check if user exists in database
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update token based on provider
    let updateQuery = "";
    let updateParams = [];

    if (provider === "google") {
      updateQuery = "UPDATE users SET google_token = ?, updated_at = NOW() WHERE email = ?";
      updateParams = [provider_token, email];
    } else if (provider === "microsoft" || provider === "azure") {
      updateQuery = "UPDATE users SET microsoft_token = ?, updated_at = NOW() WHERE email = ?";
      updateParams = [provider_token, email];
    } else if (provider === "email") {
      updateQuery = "UPDATE users SET token = ?, updated_at = NOW() WHERE email = ?";
      updateParams = [provider_token, email];
    } else {
      return res.status(400).json({ success: false, error: "Invalid provider" });
    }

    const [result] = await db.query(updateQuery, updateParams);

    if (result.affectedRows === 1) {
      console.log("User token updated successfully");
      return res.status(200).json({ success: true, message: `User's ${provider} token updated successfully` });
    } else {
      console.error("Failed to update user token");
      return res.status(500).json({ success: false, error: "Failed to update user token" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }
  
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

// Reset password (using Supabase)
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Password reset request for:", email);
    
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    
    // Request password reset email through Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || ''}/reset-password`,
    });
    
    if (error) {
      console.error("Password reset error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
    
    console.log("Password reset email sent successfully");
    return res.status(200).json({ 
      success: true, 
      message: "Password reset email sent successfully" 
    });
  } catch (error) {
    console.error("Error in password reset:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update password (using both Supabase and local database)
export const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log("Password update request for:", email);
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, error: "Email and new password are required" });
    }
    
    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error("Supabase password update error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Hash new password for local database
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      console.log("New password hashed successfully");
    } catch (hashError) {
      console.error("Error hashing new password:", hashError);
      return res.status(500).json({ success: false, error: "Error processing new password" });
    }
    
    // Update password in local database
    const [result] = await db.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?", 
      [hashedPassword, email]
    );
    
    if (result.affectedRows === 0) {
      console.log("User not found in local database");
      return res.status(404).json({ success: false, error: "User not found in local database" });
    }
    
    console.log("Password updated successfully in both systems");
    return res.status(200).json({ 
      success: true, 
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Direct password setter for testing
export const setUserPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    // Generate hash synchronously to avoid any async issues
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("DIRECT FIX: Created hash:", hashedPassword);
    
    // Update password directly
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE email = ?", 
      [hashedPassword, email]
    );
    
    console.log("DIRECT FIX: Update result:", result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Password set successfully" 
    });
  } catch (error) {
    console.error("Error setting password:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getUserRoles = async (req, res) => {
  const { user_id } = req.params;
  
  if (!user_id) {
    return res.status(400).json({ success: false, error: "User ID is required" });
  }
  
  try {
    // Get all projects where the user is a member along with their role
    const sql = `
      SELECT 
        pm.project_id, 
        pm.role
      FROM 
        projectmembers pm
      WHERE 
        pm.user_id = ?
      UNION
      SELECT 
        p.project_id, 
        'admin' as role
      FROM 
        projects p
      WHERE 
        p.creator_id = ?
        AND p.project_id NOT IN (
          SELECT project_id FROM projectmembers WHERE user_id = ?
        )
    `;
    
    const [rows] = await db.query(sql, [user_id, user_id, user_id]);
    
    // Even if there are no roles, return an empty array rather than an error
    return res.status(200).json({
      success: true,
      data: rows || []
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

// Create or update user from OAuth login
export const processOAuthLogin = async (req, res) => {
  const { email, provider, provider_token } = req.body;
  
  if (!email || !provider) {
    return res.status(400).json({ success: false, error: "Email and provider are required" });
  }
  
  try {
    // Check if user exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    if (existingUsers.length > 0) {
      // Update existing user
      const user = existingUsers[0];
      
      // Update token based on provider
      let updateSql = "";
      let params = [];
      
      if (provider === "google") {
        updateSql = "UPDATE users SET google_token = ? WHERE user_id = ?";
        params = [provider_token, user.user_id];
      } else if (provider === "azure" || provider === "microsoft") {
        updateSql = "UPDATE users SET microsoft_token = ? WHERE user_id = ?";
        params = [provider_token, user.user_id];
      }
      
      if (updateSql) {
        await db.query(updateSql, params);
      }
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } else {
      // Create new user
      const google_token = provider === "google" ? provider_token : null;
      const microsoft_token = (provider === "azure" || provider === "microsoft") ? provider_token : null;
      
      const [result] = await db.query(
        "INSERT INTO users (email, google_token, microsoft_token, created_at) VALUES (?, ?, ?, NOW())",
        [email, google_token, microsoft_token]
      );
      
      const newUser = {
        user_id: result.insertId,
        email,
        google_token,
        microsoft_token
      };
      
      return res.status(201).json({
        success: true,
        data: newUser
      });
    }
  } catch (error) {
    console.error("Error processing OAuth login:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};