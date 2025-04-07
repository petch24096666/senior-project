import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabaseClient";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");

  // Get the user's email from the session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        setError("Your password reset link has expired or is invalid. Please request a new one.");
        return;
      }
      
      const userEmail = data.session.user?.email;
      if (userEmail) {
        setEmail(userEmail);
      } else {
        setError("Unable to identify your account. Please request a new password reset link.");
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      // Update password in Supabase
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (supabaseError) {
        console.error("Supabase password update error:", supabaseError);
        setError(supabaseError.message || "Failed to update password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Also update password in your backend database
      if (email) {
        try {
          await axios.put(`${url}/api/update-password`, {
            email,
            newPassword
          });
        } catch (apiError) {
          console.error("Backend password update error:", apiError);
          // Continue anyway since Supabase update was successful
        }
      }
      
      setMessage("Password updated successfully! Redirecting to login page...");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#f5f6fa",
      padding: "0",
      margin: "0",
      overflow: "hidden",
      position: "fixed",
      top: 0,
      left: 0,
    },
    card: {
      position: "relative",
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
    lockIcon: {
      fontSize: "40px",
      marginBottom: "10px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "10px",
      fontFamily: "Inter, sans-serif",
    },
    description: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "20px",
      fontFamily: "Instrument Sans, sans-serif",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      width: "100%",
    },
    inputContainer: {
      textAlign: "left",
      width: "100%",
      marginBottom: "15px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      marginBottom: "5px",
      color: "#333",
      fontFamily: "Inria Sans, sans-serif",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
      fontFamily: "Istok Web, sans-serif",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#1877F2",
      color: "white",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      fontFamily: "system-ui, sans-serif",
      cursor: isLoading ? "not-allowed" : "pointer",
      transition: "background 0.3s",
      boxSizing: "border-box",
      opacity: isLoading ? 0.7 : 1,
      marginTop: "10px",
    },
    message: {
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "15px",
      fontSize: "14px",
      fontWeight: "500",
      width: "100%",
    },
    success: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    error: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 🔒 ไอคอนล็อค */}
        <div style={styles.lockIcon}>🔒</div>

        {/* 📝 หัวข้อ Reset Password */}
        <h2 style={styles.title}>Reset your password</h2>
        <p style={styles.description}>
          Enter your new password below to reset your account password.
        </p>

        {/* Display success or error messages */}
        {message && (
          <div style={{...styles.message, ...styles.success}}>
            ✅ {message}
          </div>
        )}
        
        {error && (
          <div style={{...styles.message, ...styles.error}}>
            ⚠️ {error}
          </div>
        )}

        {/* 📩 ฟอร์มรีเซ็ตรหัสผ่าน */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading || !email}
              style={styles.input}
              minLength={6}
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || !email}
              style={styles.input}
              minLength={6}
            />
          </div>

          {/* 🔵 ปุ่มรีเซ็ตรหัสผ่าน */}
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading || !email}
          >
            {isLoading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;