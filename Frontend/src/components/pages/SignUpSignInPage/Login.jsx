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
  const [isLoading, setIsLoading] = useState(false);

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
    await supabase.auth.signOut();  // ล้าง session เก่าทั้งหมด
    localStorage.clear();  // ล้างข้อมูลทั้งหมดใน localStorage
    sessionStorage.clear();  // ล้างข้อมูลใน sessionStorage              
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: "https://klauwpmsqqkxfjyxfpbx.supabase.co/auth/v1/callback",
      },
    });

    if (data?.url) {
      console.log("✅ Redirecting to Google OAuth...");
      window.location.href = data.url;
    }

    if (error) console.error("❌ Login error:", error);
  };

  const handleAzureLogin = async () => {
    await supabase.auth.signOut(); // ล้าง session เก่า
    localStorage.clear(); // ล้างข้อมูลเก่า
    sessionStorage.clear(); // ล้างข้อมูลใน session

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "openid email profile offline_access Calendars.ReadWrite",
        redirectTo: "https://klauwpmsqqkxfjyxfpbx.supabase.co/auth/v1/callback",
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

  // Handle Supabase auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const provider = session.user?.identities?.[0]?.provider;
        const email = session.user?.email;
  
        // Store auth provider and token
        localStorage.removeItem("authProvider");
        localStorage.removeItem("googleToken");
        localStorage.removeItem("microsoftToken");
        localStorage.removeItem("supabaseToken");
  
        if (provider === "google") {
          localStorage.setItem("authProvider", "google");
          localStorage.setItem("googleToken", session.provider_token);
        } else if (provider === "azure" || provider === "microsoft") {
          localStorage.setItem("authProvider", "microsoft");
          localStorage.setItem("microsoftToken", session.provider_token);
        } else {
          // For email/password login
          localStorage.setItem("authProvider", "email");
          localStorage.setItem("supabaseToken", session.access_token);
        }
  
        // Save user data to your database via your backend API
        axios.post(`${url}/api/oauth-login`, {
          user_id: session.user.id,
          email: email,
          provider_token: session.provider_token || session.access_token,
          provider: provider || "email",
        })
        .then(response => {
          const user = response.data;
  
          if (user) {
            // Update existing user
            axios.put(`${url}/api/update-user`, {
              email: user.email,
              token: session.provider_token || session.access_token,
              provider: provider || "email"
            });
          } else {
            // Create new user
            axios.post(`${url}/api/create-user`, {
              email: session.user.email,
              provider_token: session.provider_token || session.access_token,
              provider: provider || "email",
            });
          }
        })
        .catch(error => {
          console.error("Error saving user data:", error);
        });
  
        navigate("/dashboard");
      }
    });
  
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function login(event) {
    event.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to login with:", values);
      
      // Use Supabase email/password sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        setErrors({ general: error.message || "Login failed" });
        setIsLoading(false);
        return;
      }
      
      console.log("Login successful:", data);
      
      // Handle "remember me" functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      // User will be redirected by the auth state listener
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Something went wrong during login" });
      setIsLoading(false);
    }
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
      opacity: isLoading ? 0.7 : 1,
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
    generalError: {
      backgroundColor: "#FEE2E2",
      color: "#DC2626",
      padding: "10px",
      borderRadius: "6px",
      marginBottom: "16px",
      fontSize: "14px",
      textAlign: "center",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Please enter your details to sign in</p>
        <form onSubmit={login}>
          {errors.general && (
            <div style={styles.generalError}>
              ⚠️ {errors.general}
            </div>
          )}
          
          {/* 📩 Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              style={styles.input(errors.email)}
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
              />
              Remember me
            </label>
            <a href="/forgotpassword" style={styles.forgotLink}>Forgot password?</a>
          </div>

          {/* 🔵 Login Button */}
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {/* 🔗 Social Login */}
          <div style={styles.divider}>
            <span style={styles.line}></span>
            <span style={styles.orText}>Or continue with</span>
            <span style={styles.line}></span>
          </div>

          <div style={styles.socialButtons}>
            <button 
              type="button"
              onClick={handleGoogleLogin} 
              style={styles.socialBtn}
              disabled={isLoading}
            >
              <FaGoogle color="#DB4437" />
            </button>
            <button 
              type="button"
              onClick={handleAzureLogin} 
              style={styles.socialBtn}
              disabled={isLoading}
            >
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