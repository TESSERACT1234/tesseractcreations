import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import "./Login.css"
import logo from "../components/newlogo.png";


const Login = () => {
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, "admin@tff.com", password);
            toast.success("Login successful!");
            // No need to call onLogin — auth listener in App.js handles it
        } catch (error) {
            toast.error("Invalid password");
        }
    };

    return (
        <div className="login-container">

            <div className="login-form">
                <center><img src={logo} alt="TFF Logo" className="logo" /></center>
                <h2>Login to TFF Admin</h2>
                <input type="email" value="admin@tff.com" disabled />
                <input
                    type="password"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default Login;
