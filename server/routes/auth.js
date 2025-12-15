import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @route   POST /api/auth/google
// @desc    Auth with Google
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        let payload;

        // Try verifying as ID Token first (if sent from GoogleLogin component)
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            // If that fails, assume it's an Access Token (from useGoogleLogin implicit flow)
            // Fetch user info from Google API
            const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userInfoRes.ok) {
                return res.status(401).json({ message: 'Invalid Token' });
            }

            const userInfo = await userInfoRes.json();
            payload = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.sub
            };
        }

        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                email,
                name,
                avatar: picture,
                googleId,
                apiHandles: {
                    leetcode: email.split('@')[0],
                    codeforces: email.split('@')[0],
                    codechef: email.split('@')[0]
                }
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = picture || user.avatar;
            await user.save();
        }

        const jwtToken = generateToken(user._id);

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                apiHandles: user.apiHandles,
                stats: user.stats
            }
        });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Server Error during Auth' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ user: null });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-googleId');

        if (!user) return res.json({ user: null });

        res.json({ user });
    } catch (err) {
        res.clearCookie('token');
        res.json({ user: null });
    }
});

// @route   POST /api/auth/update-stats
// @desc    Update user stats
router.post('/update-stats', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { platform, count } = req.body;

        const updateField = {};
        updateField[`stats.${platform}`] = count;

        const user = await User.findByIdAndUpdate(decoded.id, {
            $set: updateField
        }, { new: true });

        res.json({ user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/update-handles
// @desc    Update user handles
router.post('/update-handles', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { platform, handle } = req.body; // e.g. leetcode, "new_handle"

        const updateField = {};
        updateField[`apiHandles.${platform}`] = handle;

        const user = await User.findByIdAndUpdate(decoded.id, {
            $set: updateField
        }, { new: true });

        res.json({ user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

export default router;
