import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  htmlBody: {
    margin: "0",
        padding: "0",
        width: "100%",
        height: "100%",
        overflow: "hidden",
  },
  signupPage: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(to right, #e2e2e2, #c9d6ff)",
    fallbackBackgroundColor: "#e2e2e2",
  },
  signupContainer: {
    display: "flex",
    width: "768px",
    height: "456px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    gap: "2rem",
  },
  signupLeft: {
    flex: 1,
    padding: "2rem",
    textAlign: "center",
  },
  signupLeftTitle: {
    fontSize: "1.8rem",
    marginTop: "3rem",
    marginLeft: "1rem",
  },
  signupInput: {
    backgroundColor: "#eee",
    width: "100%",
    padding: "0.8rem",
    marginBottom: "1rem",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  signupLeftButton: {
    padding: "0.8rem 2rem",
    background: "#6366F1",
    border: "none",
    color: "#fff",
    fontSize: "1rem",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "20px",
    marginLeft: "1rem",
  },
  signupRight: {
    flex: 1,
    padding: "2rem",
    textAlign: "center",
    background: "linear-gradient(135deg, #5c6bc0, #6366F1)",
    borderRadius: "150px 0 0 100px",
    color: "#fff",
  },
  signupRightTitle: {
    fontSize: "1.8rem",
    marginTop: "6rem",
  },
  signupRightDescription: {
    marginBottom: "2rem",
    fontSize: "1rem",
  },
  signupRightButton: {
    padding: "0.8rem 2rem",
    border: "2px solid #fff",
    background: "none",
    color: "#fff",
    fontSize: "1rem",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Object.assign(document.documentElement.style, styles.htmlBody);
    Object.assign(document.body.style, styles.htmlBody);

    return () => {
      document.documentElement.removeAttribute("style");
      document.body.removeAttribute("style");
    };
  }, []);

  const handleSignInClick = () => {
    navigate("/");
  };

  const [name, setName] = useState([])
  const [email, setEmail] = useState([])
  const [password, setPassword] = useState([])
  
  function signup(event) {
    event.preventDefault();

    // ข้อมูลที่ส่งไปยัง Backend
    axios.post("http://localhost:8081/signup", {
        name: name,
        email: email,
        password: password
    })
    .then(res => {
        console.log(res);
        navigate('/');
    })
    .catch(err => console.error("Error:", err));
}

  return (
    <div style={styles.signupPage}>
      <div style={styles.signupContainer}>
        <div style={styles.signupLeft}>
          <h2 style={styles.signupLeftTitle}>Sign Up</h2>
          <form onSubmit={signup}>
            <input
              type="text"
              placeholder="Name"
              style={styles.signupInput}
              onChange={e=>setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              style={styles.signupInput}
              onChange={e=>setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.signupInput}
              onChange={e=>setPassword(e.target.value)}
            />
            <button type="submit" style={styles.signupLeftButton}>
              Sign Up
            </button>
          </form>
        </div>
        <div style={styles.signupRight}>
          <h2 style={styles.signupRightTitle}>Welcome Back!</h2>
          <p style={styles.signupRightDescription}>
            To keep connected with us, please login with your personal info
          </p>
          <button style={styles.signupRightButton} onClick={handleSignInClick}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
