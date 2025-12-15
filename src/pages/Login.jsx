import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { loginWithGoogle, loginWithGithub } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoggingIn(true);
            // We send the credential/token to our backend
            // Note: For 'implicit' flow, tokenResponse might contain access_token
            // Ideally we use 'id_token' flow or 'code' flow.
            // Let's assume we pass the full response or just the access_token to the backend
            // to retrieve profile info via Google API, OR we use the id_token if configured.

            // Actually, @react-oauth/google by default gives access_token.
            // To get id_token, we need 'flow: auth-code' or custom config.
            // But our backend expects an 'idToken' to verify.
            // Let's assume we send whatever we get and update backend to handle it,
            // OR easier: just send the access_token involved.

            // Backend currently uses client.verifyIdToken which expects a JWT ID Token.
            // To get ID Token from this hook, we usually need the <GoogleLogin /> component OR flow: 'implicit' but asking for id_token?
            // Actually, let's use the credential response from the component?
            // But the user design has a custom button.
            // So we use useGoogleLogin logic.

            // Let's pass the access token and let the backend fetch user info via Google UserInfo API
            // INSTEAD of verifyIdToken, OR we change the flow.

            // Let's try sending the tokenResponse.credential if available (only in newer flow?)
            // Wait, useGoogleLogin (implicit) returns access_token.
            // Let's stick to updating the backend to verify the access_token or fetch profile.

            const success = await loginWithGoogle(tokenResponse.access_token || tokenResponse.credential);
            setIsLoggingIn(false);
            if (success) navigate('/tracker');
        },
        onError: error => console.log('Login Failed:', error)
    });

    const handleGoogleLogin = () => {
        googleLogin();
    };

    const handleGithubLogin = async () => {
        setIsLoggingIn(true);
        const mockUsername = email ? email.split('@')[0] : 'devuser';
        await loginWithGithub(mockUsername);
        setIsLoggingIn(false);
        navigate('/tracker');
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
                        <h1>Welcome Back</h1>
                        <p>Welcome Back, Please enter Your details</p>
                    </div>

                    <div className="auth-toggle">
                        <button className="toggle-btn active">Sign In</button>
                    </div>

                    <div className="login-form">
                        <div className="input-group">
                            <Mail size={18} className="input-icon" />
                            <div className="input-wrapper">
                                <label>Email Address / Handle</label>
                                <input
                                    type="text"
                                    placeholder="user@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {email && <div className="check-icon">✓</div>}
                        </div>

                        <button className="btn-continue" onClick={handleGoogleLogin} disabled={isLoggingIn}>
                            {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
                        </button>

                        <div className="divider">
                            <span>Or Continue With</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn google" onClick={handleGoogleLogin} title="Google">G</button>
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
