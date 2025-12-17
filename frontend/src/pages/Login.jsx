import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';
import loginVideo from '../assets/login.mp4';

const Login = () => {
    const navigate = useNavigate();
    const { user, loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoggingIn(true);
            const success = await loginWithGoogle(tokenResponse.access_token);
            setIsLoggingIn(false);
            if (success) navigate('/tracker');
        },
        onError: error => console.error('Google Login Failed:', error)
    });

    const [searchParams] = useSearchParams();

    // Redirect if already logged in - REVERTED to tracker as per request
    useEffect(() => {
        if (user) {
            navigate('/tracker');
        }
    }, [user, navigate]);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            handleGithubCallback(code);
        }
    }, [searchParams]);

    const handleGithubCallback = async (code) => {
        setIsLoggingIn(true);
        // Remove code from URL cleanly
        window.history.replaceState({}, document.title, "/login");
        const success = await loginWithGithub(code);
        setIsLoggingIn(false);
        if (success) navigate('/tracker');
    };

    const handleGoogleLogin = () => {
        googleLogin();
    };

    const handleGithubLogin = () => {
        // Redirect to GitHub OAuth
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID"; // Fallback or from env
        // DEBUG: Verify ID is loaded
        if (clientId.includes("YOUR_")) {
            toast.error("Please set VITE_GITHUB_CLIENT_ID in your .env file");
            return; // Don't show the debug alert anymore either
        }
        // alert(`Debug: GitHub Client ID is ${clientId}`);

        // If user hasn't set env yet, this will fail on GitHub side, which is expected during setup.
        // Alert user if key is obviously missing?
        if (clientId === "YOUR_GITHUB_CLIENT_ID") {
            toast.error("Please set VITE_GITHUB_CLIENT_ID in your .env file");
            return;
        }

        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setIsLoggingIn(true);
        let success;
        if (isRegistering) {
            if (!name) {
                toast.error("Please enter your name");
                setIsLoggingIn(false);
                return;
            }
            success = await registerWithEmail(email, password, name);
        } else {
            success = await loginWithEmail(email, password);
        }

        setIsLoggingIn(false);
        if (success) navigate('/tracker');
    };

    return (
        <div className="login-container">
            {/* Left Side - Form */}
            <div className="login-left">
                <div className="login-header">
                    <span className="logo-icon-small">🦉</span>
                    <span className="brand-name">Comptracker


                    </span>
                </div>


                <div className="login-content">
                    <div className="welcome-text">
                        <h1>{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
                        <p>{isRegistering ? 'Enter your details to sign up' : 'Welcome Back, Please enter Your details'}</p>
                    </div>

                    <div className="auth-toggle">
                        <button
                            className={`toggle-btn ${!isRegistering ? 'active' : ''}`}
                            onClick={() => setIsRegistering(false)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`toggle-btn ${isRegistering ? 'active' : ''}`}
                            style={{ marginLeft: '10px' }} // Quick style fix
                            onClick={() => setIsRegistering(true)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="login-form">
                        {isRegistering && (
                            <div className="input-group">
                                <Mail size={18} className="input-icon" /> {/* Reusing Mail icon as placeholder */}
                                <div className="input-wrapper">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <Mail size={18} className="input-icon" />
                            <div className="input-wrapper">
                                <label>Email Address</label>
                                <input
                                    type="text"
                                    placeholder="user@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {email && <div className="check-icon">✓</div>}
                        </div>

                        <div className="input-group" style={{ marginTop: '15px' }}>
                            {/* Reusing Mail icon for consistency, ideally Lock icon */}
                            <Mail size={18} className="input-icon" />
                            <div className="input-wrapper">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="btn-continue" onClick={handleSubmit} disabled={isLoggingIn}>
                            {isLoggingIn ? (isRegistering ? 'Signing up...' : 'Signing in...') : (isRegistering ? 'Sign Up' : 'Sign In')}
                        </button>

                        <div className="divider">
                            <span>Or Continue With</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn google" onClick={handleGoogleLogin} title="Google">
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </button>
                            {/* <button className="social-btn github" onClick={handleGithubLogin} title="GitHub"><Github size={20} /></button> */}
                        </div>
                    </div>


                </div>
            </div>

            {/* Right Side - Video Background */}
            <div className="login-right">
                <video
                    className="login-video"
                    src={loginVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </div>
        </div>
    );
};

export default Login;
