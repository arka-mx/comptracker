import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.set('trust proxy', 1); // Trust first proxy (Render load balancer)
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.CLIENT_URL,
            'https://comptracker-frontend.onrender.com' // Explicitly add frontend URL just in case env is missing
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Access env variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ MongoDB connected successfully'))
        .catch(err => {
            console.error('❌ MongoDB connection error:', err);
        });
} else {
    console.warn('⚠️ MONGO_URI not set. DB connection skipped.');
}

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Comptracker API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
