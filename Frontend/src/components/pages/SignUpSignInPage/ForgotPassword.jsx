import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset link sent to:", email);
    alert("A password reset link has been sent to your email.");
  };

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
    overflow: "hidden",
    position: "fixed",
    top: 0,
    left: 0,
    marginTop: "-10px"
  },
    "forgotpass-card": {
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
    "forgotpass-backIcon": {
      position: "absolute",
      top: "15px",
      left: "15px",
      fontSize: "20px",
      cursor: "pointer",
      color: "#333",
      textDecoration: "none"
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
      cursor: "pointer",
      transition: "background 0.3s",
      boxSizing: "border-box",
    },
    "forgotpass-button:hover": {
      backgroundColor: "#166FE5",
    },
  };

  return (
    <div style={styles["forgotpass-container"]}>
      <div style={styles["forgotpass-card"]}>
        <a href="/" style={styles["forgotpass-backIcon"]}>
          ←
        </a>

        <div style={styles["forgotpass-lockIcon"]}>🔒</div>

        <h2 style={styles["forgotpass-title"]}>Forgot your password?</h2>
        <p style={styles["forgotpass-description"]}>
          Enter your email address and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={styles["forgotpass-form"]}>
          <div style={styles["forgotpass-inputContainer"]}>
            <label style={styles["forgotpass-label"]}>Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles["forgotpass-input"]}
            />
          </div>

          <button type="submit" style={styles["forgotpass-button"]}>
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
