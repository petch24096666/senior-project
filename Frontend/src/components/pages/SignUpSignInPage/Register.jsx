import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../../../utils/supabaseClient";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";

const url = import.meta.env.VITE_BACKEND_URL;

const RegisterPage = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleGoogleLogin = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
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
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();

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

  async function register(event) {
    event.preventDefault();
  
    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
  
    if (!agree) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
  
    setIsRegistering(true);
    setError("");
  
    try {
      console.log("Starting registration process");
      
      // Step 1: Register with Supabase
      console.log("Registering with Supabase");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullname,
          },
        },
      });

      if (error) {
        console.error("Supabase registration error:", error);
        setError(error.message);
        setIsRegistering(false);
        return;
      }

      console.log("Supabase registration successful");

      // Step 2: Send data to your backend including the password
      try {
        console.log("Saving user data to database");
        // Use /api/register instead of /api/create-user to ensure password hashing
        const backendResponse = await axios.post(`${url}/api/register`, {
          fullname,
          email,
          password, // Important: Send the password to be hashed on the backend
          provider: "email",
          token: data.session?.access_token || null,
        });

        console.log("Database save response:", backendResponse.data);
        
        if (!backendResponse.data.success) {
          console.error("Database save error:", backendResponse.data.error);
          setError("Registration successful, but there was an issue saving your profile.");
          setIsRegistering(false);
          return;
        }
        
        // Show confirmation message instead of immediately redirecting
        setRegistrationComplete(true);
        setRegisteredEmail(email);
        
      } catch (apiError) {
        console.error("API Error:", apiError.response?.data || apiError);
        setError("Registration successful, but we couldn't save your complete profile. Please check your email to confirm your account.");
        // Still show confirmation since Supabase registration was successful
        setRegistrationComplete(true);
        setRegisteredEmail(email);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong during registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  }

  const redirectToLogin = () => {
    navigate("/");
  };

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
      height: registrationComplete ? "auto" : "670px",
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
    errorMessage: {
      display: "flex",
      alignItems: "center",
      color: "#D32F2F",
      fontSize: "14px",
      marginTop: "5px",
      marginBottom: "10px",
    },
    errorIcon: {
      marginRight: "8px",
      fontSize: "16px",
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
      fontWeight: "600",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: agree ? "#2563EB" : "#A0AEC0",
      color: "white",
      borderRadius: "8px",
      border: "none",
      cursor: agree ? "pointer" : "not-allowed",
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "24px",
      opacity: isRegistering ? 0.7 : 1,
    },
    loginButton: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#2563EB",
      color: "white",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      marginTop: "20px",
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
    confirmationIcon: {
      fontSize: "64px",
      margin: "20px 0",
    },
    confirmationTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "16px",
    },
    confirmationText: {
      fontSize: "16px",
      color: "#4B5563",
      marginBottom: "16px",
      lineHeight: "1.5",
    },
    emailHighlight: {
      fontWeight: "bold",
      color: "#2563EB",
    }
  };

  // If registration is complete, show confirmation screen
  if (registrationComplete) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.confirmationIcon}>✉️</div>
          <h2 style={styles.confirmationTitle}>Check your email</h2>
          <p style={styles.confirmationText}>
            We've sent a confirmation email to <span style={styles.emailHighlight}>{registeredEmail}</span>
          </p>
          <p style={styles.confirmationText}>
            Please check your inbox and click on the verification link to activate your account. 
            If you don't see the email, check your spam folder.
          </p>
          <button 
            style={styles.loginButton}
            onClick={redirectToLogin}
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

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
            <input 
              type="text" 
              placeholder="John Doe" 
              style={styles.input} 
              value={fullname}
              onChange={e => setFullname(e.target.value)} 
              disabled={isRegistering}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <input 
              type="email" 
              placeholder="john@example.com" 
              style={styles.input} 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              disabled={isRegistering}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="∗∗∗∗∗∗∗∗∗" 
              style={styles.input} 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              disabled={isRegistering}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>🚨</span> {error}
              </div>
            )}
            <input 
              type="password" 
              placeholder="∗∗∗∗∗∗∗∗∗" 
              style={styles.input} 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} 
              disabled={isRegistering}
              required 
            />
          </div>

          <div style={styles.options}>
            <input 
              type="checkbox" 
              style={styles.checkbox} 
              checked={agree} 
              onChange={() => setAgree(!agree)} 
              disabled={isRegistering}
            />
            <label style={styles.textlink}>
              I agree to the <a href="#" style={styles.link}>Terms of Service</a> and{" "}
              <a href="#" style={styles.link}>Privacy Policy</a>
            </label>
          </div>

          <button 
            style={styles.button} 
            type="submit"
            disabled={!agree || isRegistering}
          >
            {isRegistering ? "Registering..." : "Register"}
          </button>
        </form>
        <div style={styles.divider}>
          <span style={styles.line}></span>
          <span style={styles.orText}>Or continue with</span>
          <span style={styles.line}></span>
        </div>
        <div style={styles.socialButtons}>
          <button 
            type="button"
            style={styles.socialBtn} 
            onClick={handleGoogleLogin}
            disabled={isRegistering}
          >
            <FaGoogle color="#DB4437" />
          </button>
          <button 
            type="button"
            style={styles.socialBtn}
            onClick={handleAzureLogin}
            disabled={isRegistering}
          >
            <FaMicrosoft color="#0078D4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;