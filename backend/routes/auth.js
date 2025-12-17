import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import LocalUser from '../models/LocalUser.js';
import fetch from 'node-fetch';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT with user type
const generateToken = (id, type) => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register local user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        let user = await LocalUser.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await LocalUser.create({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            apiHandles: {
                leetcode: email.split('@')[0],
                codeforces: email.split('@')[0],
                codechef: email.split('@')[0]
            }
        });

        const token = generateToken(user._id, 'local');

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                apiHandles: user.apiHandles,
                stats: user.stats,
                type: 'local'
            }
        });

    } catch (err) {
        console.error('Register Error Stack:', err.stack); // Log full stack
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login local user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await LocalUser.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, 'local');

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                apiHandles: user.apiHandles,
                stats: user.stats,
                type: 'local'
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/github
// @desc    Auth with GitHub
router.post('/github', async (req, res) => {
    try {
        const { code } = req.body;

        // Exchange code for access token
        const tokenRes = await fetch(`https://github.com/login/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            return res.status(401).json({ message: tokenData.error_description || 'GitHub Login Failed' });
        }

        const accessToken = tokenData.access_token;

        // Fetch user profile
        const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const userProfile = await userRes.json();

        // If email is null (private), fetch emails
        if (!userProfile.email) {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const emails = await emailsRes.json();
            const primaryEmail = emails.find(e => e.primary && e.verified);
            userProfile.email = primaryEmail ? primaryEmail.email : null;
        }

        if (!userProfile.email) {
            return res.status(400).json({ message: 'GitHub account must have a verified email' });
        }

        const { email, name, avatar_url, id } = userProfile;
        const githubId = id.toString();

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                email,
                name: name || userProfile.login, // Use login if name is null
                avatar: avatar_url,
                githubId,
                apiHandles: {
                    leetcode: email.split('@')[0],
                    codeforces: email.split('@')[0],
                    codechef: email.split('@')[0]
                }
            });
        } else if (!user.githubId) {
            user.githubId = githubId;
            user.avatar = avatar_url || user.avatar;
            await user.save();
        }

        const token = generateToken(user._id, 'github');

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                apiHandles: user.apiHandles,
                stats: user.stats,
                type: 'github'
            }
        });

    } catch (err) {
        console.error('GitHub Auth Error:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

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

        const jwtToken = generateToken(user._id, 'google');

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                apiHandles: user.apiHandles,
                stats: user.stats,
                type: 'google'
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

        let user;
        if (decoded.type === 'local') {
            user = await LocalUser.findById(decoded.id).select('-password');
        } else {
            user = await User.findById(decoded.id).select('-googleId');
        }

        if (!user) return res.json({ user: null });

        res.json({ user: { ...user.toObject(), type: decoded.type } });
    } catch (err) {
        res.clearCookie('token');
        res.json({ user: null });
    }
});



// @route   POST /api/auth/update-handles
// @desc    Update user handles
router.post('/update-handles', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { platform, handle } = req.body;

        const updateField = {};
        updateField[`apiHandles.${platform}`] = handle;

        let user;
        if (decoded.type === 'local') {
            user = await LocalUser.findByIdAndUpdate(decoded.id, {
                $set: updateField
            }, { new: true }).select('-password');
        } else {
            user = await User.findByIdAndUpdate(decoded.id, {
                $set: updateField
            }, { new: true });
        }

        res.json({ user: { ...user.toObject(), type: decoded.type } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/update-profile
// @desc    Update user profile details
router.post('/update-profile', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, bio, phone, location, avatar } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (bio) updateFields.bio = bio;
        if (phone) updateFields.phone = phone;
        if (location) updateFields.location = location;
        if (avatar) updateFields.avatar = avatar;

        let user;
        if (decoded.type === 'local') {
            user = await LocalUser.findByIdAndUpdate(decoded.id, {
                $set: updateFields
            }, { new: true }).select('-password');
        } else {
            user = await User.findByIdAndUpdate(decoded.id, {
                $set: updateFields
            }, { new: true });
        }

        res.json({ user: { ...user.toObject(), type: decoded.type } });

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    });
    res.json({ message: 'Logged out' });
});

// @route   DELETE /api/auth/delete
// @desc    Delete user account
router.delete('/delete', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type === 'local') {
            await LocalUser.findByIdAndDelete(decoded.id);
        } else {
            await User.findByIdAndDelete(decoded.id);
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        });
        res.json({ message: 'Account deleted' });

    } catch (err) {
        console.error('Delete Account Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/auth/leetcode/:handle
// @desc    Fetch LeetCode stats and submission calendar
router.get('/leetcode/:handle', async (req, res) => {
    try {
        const { handle } = req.params;
        const query = `
            query userSessionProgress($username: String!) {
                matchedUser(username: $username) {
                    submissionCalendar
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query,
                variables: { username: handle }
            })
        });

        const data = await response.json();

        if (data.errors) {
            return res.status(404).json({ message: 'User not found or LeetCode API error' });
        }

        const matchedUser = data.data.matchedUser;
        if (!matchedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const submissionCalendar = JSON.parse(matchedUser.submissionCalendar);
        const totalSolved = matchedUser.submitStats.acSubmissionNum.find(s => s.difficulty === 'All').count;

        res.json({
            totalSolved,
            submissionCalendar
        });

    } catch (err) {
        console.error('LeetCode Proxy Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;

