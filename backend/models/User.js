import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: String,
    avatar: String,
    bio: String,
    phone: String,
    location: String,
    apiHandles: {
        leetcode: String,
        codeforces: String,
        codechef: String
    },
    stats: {
        leetcode: { type: Number, default: 0 },
        codeforces: { type: Number, default: 0 },
        codechef: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);
