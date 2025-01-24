import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

    const navigate = useNavigate();

    const handleLogin = () => {
      navigate("/register");
    };
  
const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#F9FAFB",
      margin: "0",
      fontFamily: "'Arial', sans-serif",
    },
    card: {
      width: "400px",
      padding: "40px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6B7280",
      marginBottom: "24px",
    },
    inputGroup: {
      textAlign: "left",
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      color: "#4B5563",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      fontSize: "14px",
      backgroundColor: "#F9FAFB",
      outline: "none",
    },
    inputPlaceholder: {
      color: "#9CA3AF",
    },
    options: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      color: "#4B5563",
      marginBottom: "24px",
    },
    forgotLink: {
      color: "#2563EB",
      textDecoration: "none",
    },
    forgotHover: {
      textDecoration: "underline",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#2563EB",
      color: "white",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "24px",
    },
    buttonHover: {
      backgroundColor: "#1D4ED8",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "24px",
    },
    line: {
      flex: 1,
      height: "1px",
      backgroundColor: "#E5E7EB",
      margin: "0 10px",
    },
    orText: {
      fontSize: "14px",
      color: "#6B7280",
    },
    socialButtons: {
      display: "flex",
      justifyContent: "center",
      gap: "16px",
      marginBottom: "24px",
    },
    socialBtn: {
      width: "50px",
      height: "50px",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      backgroundColor: "white",
      fontSize: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    socialBtnHover: {
      backgroundColor: "#F3F4F6",
    },
    signup: {
      fontSize: "14px",
      color: "#4B5563",
    },
    signupLink: {
      color: "#2563EB",
      textDecoration: "none",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Please enter your details to sign in</p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="********"
            style={styles.input}
          />
        </div>

        <div style={styles.options}>
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" style={styles.forgotLink}>
            Forgot password?
          </a>
        </div>

        <button style={styles.button}>Sign in</button>

        <div style={styles.divider}>
          <span style={styles.line}></span>
          <span style={styles.orText}>Or continue with</span>
          <span style={styles.line}></span>
        </div>

        <div style={styles.socialButtons}>
          <button style={styles.socialBtn}>G</button>
          <button style={styles.socialBtn}>🔗</button>
          <button style={styles.socialBtn}>📁</button>
        </div>

        <p style={styles.signup}>
          Don't have an account?{" "}
          <a href="#" style={styles.signupLink} onClick={handleLogin}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
