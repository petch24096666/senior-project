import { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      console.log("Requesting password reset for:", email);
      
      // Request password reset via Supabase
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (supabaseError) {
        console.error("Supabase reset error:", supabaseError);
        setError(supabaseError.message || "Failed to send reset email. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Also notify your backend (optional)
      try {
        await axios.post(`${url}/api/reset-password`, { email });
      } catch (apiError) {
        console.error("Backend notification error:", apiError);
        // Continue anyway since Supabase reset was successful
      }
      
      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log("Go back clicked");
    window.history.back();
  };

  // 🎨 CSS แบบ inline (รวมอยู่ในไฟล์ JSX)
  const styles = {
    "forgotpass-container": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f5f6fa",
    padding: "0",
    margin: "0",
    overflow: "hidden", // ✅ ปิด Scrollbar แนวตั้ง & แนวนอน
    position: "fixed", // ✅ ทำให้คงที่ไม่ขยับ
    top: 0,
    left: 0,
  },
    "forgotpass-card": {
      position: "relative", // ✅ ใช้สำหรับจัดไอคอน Back
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      maxWidth: "400px",
      minWidth: "350px",
      width: "100%",
      margin: "auto",
    },
    "forgotpass-backIcon": {
      position: "absolute",
      top: "15px",
      left: "15px",
      fontSize: "20px",
      cursor: "pointer",
      color: "#333",
    },
    "forgotpass-lockIcon": {
      fontSize: "40px",
      marginBottom: "10px",
    },
    "forgotpass-title": {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "10px",
      fontFamily: "Inter, sans-serif",
    },
    "forgotpass-description": {
      fontSize: "14px",
      color: "#666",
      marginBottom: "20px",
      fontFamily: "Instrument Sans, sans-serif",
    },
    "forgotpass-form": {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      width: "100%",
    },
    "forgotpass-inputContainer": {
      textAlign: "left",
      width: "100%",
    },
    "forgotpass-label": {
      display: "block",
      fontSize: "14px",
      marginBottom: "5px",
      color: "#333",
      fontFamily: "Inria Sans, sans-serif",
    },
    "forgotpass-input": {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
      fontFamily: "Istok Web, sans-serif",
      boxSizing: "border-box",
    },
    "forgotpass-button": {
      width: "100%",
      padding: "12px",
      backgroundColor: "#1877F2",
      color: "white",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      fontFamily: "Irish Grover, cursive",
      cursor: isLoading ? "not-allowed" : "pointer",
      transition: "background 0.3s",
      boxSizing: "border-box",
      opacity: isLoading ? 0.7 : 1,
    },
    "forgotpass-button:hover": {
      backgroundColor: "#166FE5",
    },
    "forgotpass-message": {
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "15px",
      fontSize: "14px",
      fontWeight: "500",
    },
    "forgotpass-success": {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    "forgotpass-error": {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    }
  };

  return (
    <div style={styles["forgotpass-container"]}>
      <div style={styles["forgotpass-card"]}>
        {/* 🔙 ไอคอน Back */}
        <div style={styles["forgotpass-backIcon"]} onClick={handleBack}>
          ←
        </div>

        {/* 🔒 ไอคอนล็อค */}
        <div style={styles["forgotpass-lockIcon"]}>🔒</div>

        {/* 📝 หัวข้อ Forgot Password */}
        <h2 style={styles["forgotpass-title"]}>Forgot your password?</h2>
        <p style={styles["forgotpass-description"]}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* Display success or error messages */}
        {message && (
          <div style={{...styles["forgotpass-message"], ...styles["forgotpass-success"]}}>
            ✅ {message}
          </div>
        )}
        
        {error && (
          <div style={{...styles["forgotpass-message"], ...styles["forgotpass-error"]}}>
            ⚠️ {error}
          </div>
        )}

        {/* 📩 ฟอร์มป้อนอีเมล */}
        <form onSubmit={handleSubmit} style={styles["forgotpass-form"]}>
          <div style={styles["forgotpass-inputContainer"]}>
            <label style={styles["forgotpass-label"]}>Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={styles["forgotpass-input"]}
            />
          </div>

          {/* 🔵 ปุ่มส่งลิงก์รีเซ็ตรหัสผ่าน */}
          <button 
            type="submit" 
            style={styles["forgotpass-button"]}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;