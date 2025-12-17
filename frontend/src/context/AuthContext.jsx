import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from backend on mount (verify cookie)
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Failed to load user session', error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const loginWithGoogle = async (token) => {
        // In a real Google Auth flow (using @react-oauth/google), 'token' is the ID token returned by Google
        // For this implementation, since we are moving away from the "Simulated" flow where we just passed email,
        // we need to expect a token. 

        // HOWEVER, since the user hasn't set up the Google Client ID yet, the Login component 
        // won't be able to get a *real* Google token to send here.

        // To keep the app functional for the user to verify the "structure", 
        // I will add a fallback that assumes if 'token' is just an email string (from our mock login UI),
        // we might need a dev-only endpoint or handle it. 
        // But ideally, the backend expects a JWT from Google.

        // For now, let's implement the standard fetch call.
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                return data.user;
            } else {
                console.error('Login failed:', data.message);
                // Fallback for demo if backend rejects (due to missing keys)
                // We alert the user they need to configure env
                toast.error(`Backend Login Failed: ${data.message}. \n\nPlease configure server .env with real keys.`);
                return null;
            }
        } catch (error) {
            console.error('Login request failed', error);
            return null;
        }
    };

    // Keep the Github mock or remove? User asked to "implement google auth". 
    // We can keep github as a simulated fallback or separate route.
    const loginWithEmail = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                return true;
            } else {
                toast.error(data.message || 'Login failed');
                return false;
            }
        } catch (error) {
            console.error('Login error', error);
            return false;
        }
    };

    const registerWithEmail = async (email, password, name) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                return true;
            } else {
                toast.error(data.message || 'Registration failed');
                return false;
            }
        } catch (error) {
            console.error('Registration error', error);
            return false;
        }
    };

    const loginWithGithub = async (code) => {
        try {
            const res = await fetch('/api/auth/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                return true;
            } else {
                toast.error(data.message || 'GitHub Login failed');
                return false;
            }
        } catch (error) {
            console.error('GitHub Login error', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };





    const updateHandle = async (platform, handle) => {
        // Optimistic update
        setUser(prev => ({
            ...prev,
            apiHandles: { ...prev?.apiHandles, [platform]: handle }
        }));

        try {
            const res = await fetch('/api/auth/update-handles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, handle })
            });
            const data = await res.json();
            if (data.user) setUser(data.user);
        } catch (err) {
            console.error('Failed to update handle', err);
        }
    };

    const updateProfile = async (details) => {
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error('Update profile error', err);
            return false;
        }
    };

    const deleteAccount = async () => {
        try {
            const res = await fetch('/api/auth/delete', { method: 'DELETE' });
            if (res.ok) {
                setUser(null);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Delete account error', err);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail, updateHandle, updateProfile, deleteAccount, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
