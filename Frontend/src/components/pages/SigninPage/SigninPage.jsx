import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const styles = {
    htmlBody: {
        margin: "0",
        padding: "0",
        width: "100%",
        height: "100%",
        overflow: "hidden",
    },
    signinPage: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #e2e2e2, #c9d6ff)",
        fallbackBackgroundColor: "#e2e2e2",
    },
    signinContainer: {
        display: "flex",
        width: "768px",
        height: "456px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        gap: "2rem",
    },
    signinLeft: {
        flex: 1,
        padding: "2rem",
        textAlign: "center",
    },
    signinLeftTitle: {
        fontSize: "1.8rem",
        marginTop: "3rem",
        marginLeft: "1rem",
    },
    signinInput: {
        backgroundColor: "#eee",
        width: "100%",
        padding: "0.8rem",
        marginBottom: "1rem",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "1rem",
    },
    forgotPassword: {
        fontSize: "0.9rem",
        color: "#4a90e2",
        marginBottom: "1.5rem",
        cursor: "pointer",
        marginLeft: "1rem",
    },
    signinButton: {
        padding: "0.8rem 2rem",
        backgroundColor: "#6366F1",
        border: "none",
        color: "#fff",
        fontSize: "1rem",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginLeft: "1rem",
    },
    signinRight: {
        flex: 1,
        padding: "2rem",
        textAlign: "center",
        background: "linear-gradient(135deg, #5c6bc0, #6366F1)",
        borderRadius: "150px 0 0 100px",
        color: "#fff",
    },
    signinRightTitle: {
        fontSize: "1.8rem",
        marginTop: "6rem",
    },
    signinRightDescription: {
        marginBottom: "2rem",
        fontSize: "1rem",
    },
    signupButton: {
        padding: "0.8rem 2rem",
        border: "2px solid #fff",
        background: "none",
        color: "#fff",
        fontSize: "1rem",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
        signupButtonHover: {
        background: "#fff",
        color: "#4a90e2",
    },
};

const SignIn = () => {
    const navigate = useNavigate();
    const handleSignUpClick = () => {
      navigate('/signup'); // นำทางไปยังหน้า Sign Up
    };  
    useEffect(() => {
        Object.assign(document.documentElement.style, styles.htmlBody);
        Object.assign(document.body.style, styles.htmlBody);

    // Clean up styles on unmount
    return () => {
      document.documentElement.removeAttribute("style");
      document.body.removeAttribute("style");
    };
    }, []);

    const [values, setValues] = useState({
        email: '',
        password: ''
    })

    function signin(event){
        event.preventDefault();
        axios.post("http://localhost:8081/signin", values)
        .then(res=>{
            if(res.data.Status === "Success"){
                navigate("/dashboard")
            }else{
                alert(res.data.Error)
            }
        }).catch(err=>console.log(err))
    }

    return (
        <div style={styles.signinPage}>
            <div style={styles.signinContainer}>
                <div style={styles.signinLeft}>
                    <h2 style={styles.signinLeftTitle}>Sign In</h2>
                    <form onSubmit={signin}>
                        <input type="email" placeholder="Email" style={styles.signinInput} 
                        onChange={e=>setValues({...values,email:e.target.value})} />
                        <input type="password" placeholder="Password" style={styles.signinInput}
                        onChange={e=>setValues({...values,password:e.target.value})} />
                        <p style={styles.forgotPassword}>Forgot Your Password?</p>
                        <button type="submit" style={styles.signinButton}>Sign In</button>
                    </form>
                </div>
                <div style={styles.signinRight}>
                    <h2 style={styles.signinRightTitle}>Hello, Friend!</h2>
                    <p style={styles.signinRightDescription}>
                        Register with your personal details to use all of the site features
                    </p>
                    <button style={styles.signupButton} onClick={handleSignUpClick}>
                    Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
