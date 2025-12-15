import mongoose from 'mongoose';
import User from '../server/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate.`);

        for (const user of users) {
            let updated = false;
            if (!user.apiHandles.geeksforgeeks) {
                user.apiHandles.geeksforgeeks = user.email.split('@')[0];
                updated = true;
            }
            if (!user.stats.geeksforgeeks && user.stats.geeksforgeeks !== 0) {
                user.stats.geeksforgeeks = 0;
                updated = true;
            }

            if (updated) {
                await user.save();
                console.log(`Migrated user: ${user.email}`);
            } else {
                console.log(`User ${user.email} already up to date.`);
            }
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

migrateUsers();
