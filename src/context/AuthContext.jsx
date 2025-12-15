import React, { createContext, useContext, useState, useEffect } from 'react';

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
                alert(`Backend Login Failed: ${data.message}. \n\nPlease configure server .env with real keys.`);
                return null;
            }
        } catch (error) {
            console.error('Login request failed', error);
            return null;
        }
    };

    // Keep the Github mock or remove? User asked to "implement google auth". 
    // We can keep github as a simulated fallback or separate route.
    const loginWithGithub = async (username) => {
        // TODO: Implement GitHub Auth Backend Flow
        alert("GitHub Auth backend not yet implemented. Please use Google or configure backend.");
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    // Helper to update stats in state and backend
    const updateStats = async (platform, count) => {
        // Optimistic update
        setUser(prev => ({
            ...prev,
            stats: { ...prev?.stats, [platform]: count }
        }));

        try {
            await fetch('/api/auth/update-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, count })
            });
        } catch (err) {
            console.error('Failed to sync stats to backend', err);
        }
    }



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

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithGithub, logout, updateStats, updateHandle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
