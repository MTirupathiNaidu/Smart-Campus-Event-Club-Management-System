const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Get an admin user
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin found, creating a dummy one...');
            admin = await User.create({
                name: 'Seed Admin',
                email: 'seedadmin@campus.edu',
                password: 'hashedpassword',
                role: 'admin'
            });
        }

        const now = new Date();

        const events = [
            {
                title: 'Tech Symposium 2026',
                description: 'Annual technology symposium featuring guest talks and project showcases.',
                date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
                startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() - 20 * 60 * 60 * 1000), // 4 hrs long
                prizeTime: new Date(now.getTime() - 19 * 60 * 60 * 1000), // Prize distributed
                venue: 'Main Auditorium',
                max_participants: 500,
                created_by: admin._id
            },
            {
                title: 'Campus Hackathon',
                description: '24-hour hackathon to build innovative solutions.',
                date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // started 2 hours ago
                startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 22 * 60 * 60 * 1000), // Ongoing
                prizeTime: new Date(now.getTime() + 23 * 60 * 60 * 1000),
                venue: 'Innovation Lab',
                max_participants: 200,
                created_by: admin._id
            },
            {
                title: 'Cultural Fest: Euphoria',
                description: 'A night of music, dance, and cultural performances.',
                date: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 days from now
                startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 52 * 60 * 60 * 1000), // Upcoming
                prizeTime: null,
                venue: 'Open Air Theatre',
                max_participants: 1000,
                created_by: admin._id
            }
        ];

        await Event.insertMany(events);
        console.log('Events seeded successfully!');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedEvents();
