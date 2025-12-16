import mongoose from 'mongoose';
import User from '../../backend/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyUserSchema = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({});
        console.log('User found:', user.email);
        console.log('API Handles:', user.apiHandles);
        console.log('Stats:', user.stats);

        if (user.apiHandles.geeksforgeeks !== undefined && user.stats.geeksforgeeks !== undefined) {
            console.log('PASS: GeeksForGeeks field exists in User document.');
        } else {
            console.log('FAIL: GeeksForGeeks field missing.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyUserSchema();
