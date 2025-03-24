import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../../../utils/supabaseClient";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";


const url = import.meta.env.VITE_BACKEND_URL;

const LoginPage = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setValues((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  function validateForm() {
    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!values.email.trim()) {
      newErrors.email = "โปรดกรอกอีเมลหรือหมายเลขโทรศัพท์";
    } else if (!emailRegex.test(values.email) && !phoneRegex.test(values.email)) {
      newErrors.email = "อีเมลหรือหมายเลขโทรศัพท์ไม่ถูกต้อง";
    }

    if (!values.password.trim()) {
      newErrors.password = "โปรดกรอกรหัสผ่าน";
    } else if (values.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: "https://klauwpmsqqkxfjyxfpbx.supabase.co/auth/v1/callback",
      },
    });
  
    if (data?.url) {
      console.log("✅ Redirecting to Google OAuth...");
      window.location.href = data.url; // ✅ Redirect ไปยัง Google OAuth
    }
  
    if (error) console.error("❌ Login error:", error);
  };
  
  const handleAzureLogin = async () => {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "openid email profile offline_access",
        redirectTo: "http://localhost:5173/", // ✅ ต้องตรงกับที่ตั้งไว้ใน Supabase
      },
    });
  
    if (data?.url) {
      console.log("✅ Redirecting to Azure OAuth...");
      window.location.href = data.url;
    }
  
    if (error) {
      console.error("❌ Azure Login error:", error);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth State Changed:", event, session);
  
      if (session?.provider_token) {
        const provider = session.user?.app_metadata?.provider;
        console.log("✅ Logged in via:", provider);
        localStorage.setItem(`${provider}Token`, session.provider_token);
        navigate("/dashboard");
      } else {
        console.log("❌ No session available.");
      }
    });
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  

  function login(event) {
    event.preventDefault();
    if (!validateForm()) return;
  
    console.log("Attempting to login with:", values);
  
    axios.post(`${url}/api/login`, values)
      .then((res) => {
        console.log("Login response received:", res.data);
  
        if (res.data.success) {
          if (rememberMe) {
            localStorage.setItem("rememberedEmail", values.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }
          navigate("/dashboard");
        } else {
          setErrors({ general: res.data.error || "Login failed" });
        }
      })
      .catch((err) => {
        console.error("API Error:", err.response?.data || err.message);
        setErrors({ general: err.response?.data?.error || "Something went wrong" });
      });
  }

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
    input: (hasError) => ({
      width: "100%",
      padding: "12px",
      border: `1px solid ${hasError ? "#E53E3E" : "#E5E7EB"}`,
      backgroundColor: "#F9FAFB",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    }),
    errorText: {
      color: "#E53E3E",
      fontSize: "12px",
      marginTop: "4px",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    options: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "14px",
      color: "#4B5563",
      marginBottom: "24px",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
    },
    checkbox: {
      marginRight: "8px",
    },
    forgotLink: {
      color: "#2563EB",
      textDecoration: "none",
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
        <form onSubmit={login}>
          {/* 📩 Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              style={styles.input(errors.email)}
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              required
            />
            {errors.email && (
              <div style={styles.errorText}>⚠️ {errors.email}</div>
            )}
          </div>

          {/* 🔑 Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="********"
              style={styles.input(errors.password)}
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              required
            />
            {errors.password && (
              <div style={styles.errorText}>⚠️ {errors.password}</div>
            )}
          </div>

          {/* 🔘 Remember Me + Forgot Password */}
          <div style={styles.options}>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="/forgotpassword" style={styles.forgotLink}>Forgot password?</a>
          </div>

          {/* 🔵 Login Button */}
          <button type="submit" style={styles.button}>Sign in</button>

          {/* 🔗 Social Login */}
          <div style={styles.divider}>
            <span style={styles.line}></span>
            <span style={styles.orText}>Or continue with</span>
            <span style={styles.line}></span>
          </div>

          <div style={styles.socialButtons}>
  <button onClick={handleGoogleLogin} style={styles.socialBtn}>
    <FaGoogle color="#DB4437" />
  </button>
  <button onClick={handleAzureLogin} style={styles.socialBtn}>
    <FaMicrosoft color="#0078D4" />
  </button>
</div>

          <p style={styles.signup}>
            Don't have an account? <a href="/register" style={styles.signupLink}>Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
