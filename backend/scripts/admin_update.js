import mongoose from 'mongoose';
import User from '../server/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateHandle = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all users for simplicity in this dev environment
        const result = await User.updateMany(
            {},
            { $set: { "apiHandles.leetcode": "arkapal" } }
        );

        console.log(`Updated ${result.modifiedCount} users to have LeetCode handle 'arkapal'.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateHandle();
