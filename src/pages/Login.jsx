import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Github, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

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
        // If user hasn't set env yet, this will fail on GitHub side, which is expected during setup.
        // Alert user if key is obviously missing?
        if (clientId === "YOUR_GITHUB_CLIENT_ID") {
            alert("Please set VITE_GITHUB_CLIENT_ID in your .env file");
            return;
        }

        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        setIsLoggingIn(true);
        let success;
        if (isRegistering) {
            if (!name) {
                alert("Please enter your name");
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
                    <span className="brand-name">Comptracker</span>
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
                            <button className="social-btn google" onClick={handleGoogleLogin} title="Google"><Chrome size={20} /></button>
                            <button className="social-btn github" onClick={handleGithubLogin} title="GitHub"><Github size={20} /></button>
                        </div>
                    </div>

                    <div className="login-footer-text">
                        Join the millions of coders who track their progress. Log in to sync your stats.
                    </div>
                </div>
            </div>

            {/* Right Side - Empty with Orange Theme */}
            <div className="login-right">
                {/* Empty as requested */}
            </div>
        </div>
    );
};

export default Login;
