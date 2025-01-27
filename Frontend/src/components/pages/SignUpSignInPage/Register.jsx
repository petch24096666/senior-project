import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const url = import.meta.env.VITE_BACKEND_URL;

const RegisterPage = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  function register(event) {
    event.preventDefault();
    axios.post(`${url}/api/register`, { fullname, email, password })
      .then(res => {
        navigate("/");
      }).catch(err => console.log(err));
  }

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "97vh",
      backgroundColor: "#F9FAFB",
      margin: "0",
      fontFamily: "'Arial', sans-serif",
    },
    card: {
      width: "400px",
      height: "600px",
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
      marginTop: "-5px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6B7280",
      marginBottom: "24px",
    },
    inputGroup: {
      textAlign: "left",
      marginBottom: "16px",
      marginRight: "25px",
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
    options: {
      display: "flex",
      justifyContent: "left",
      alignItems: "center",
      fontSize: "14px",
      color: "#4B5563",
      marginBottom: "24px",
    },
    checkbox: {
      height: "1.7vh",
      marginRight: "5px",
      verticalAlign: "bottom",
    },
    textlink: {
      marginBottom: "-2px"
    },
    link: {
      color: "#2563EB",
      textDecoration: "none",
      fontWeight: "500",
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
      width: "100px",
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
    signup: {
      fontSize: "14px",
      color: "#4B5563",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>
          Already have an account? <a href="/" style={styles.link}>Sign in</a>
        </p>
        <form onSubmit={register}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" placeholder="John Doe" style={styles.input} onChange={e => setFullname(e.target.value)}/>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <input type="email" placeholder="john@example.com" style={styles.input} onChange={e => setEmail(e.target.value)}/>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" placeholder="∗∗∗∗∗∗∗∗∗" style={styles.input} onChange={e => setPassword(e.target.value)}/>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" placeholder="∗∗∗∗∗∗∗∗∗" style={styles.input} />
          </div>

          <div style={styles.options}>
            <input type="checkbox" style={styles.checkbox} />
            <label style={styles.textlink}>
              I agree to the <a href="#" style={styles.link}>Terms of Service</a> and{" "}
              <a href="#" style={styles.link}>Privacy Policy</a>
            </label>
          </div>

          <button style={styles.button}>Register</button>
        </form>
        <div style={styles.divider}>
          <span style={styles.line}></span>
          <span style={styles.orText}>Or continue with</span>
          <span style={styles.line}></span>
        </div>

        <div style={styles.socialButtons}>
          <button style={styles.socialBtn}>G</button>
          <button style={styles.socialBtn}></button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;