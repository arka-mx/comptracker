import mongoose from 'mongoose';

const localUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'User'
    },
    avatar: {
        type: String,
        default: ''
    },
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
}, { collection: 'locals' });

export default mongoose.model('LocalUser', localUserSchema);
