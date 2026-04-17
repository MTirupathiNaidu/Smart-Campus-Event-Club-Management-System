const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

// ─── CONFIGURE YOUR ADMIN DETAILS HERE ───
const ADMIN = {
    name: 'Admin',
    email: 'admin@campus.edu',
    password: 'Admin@123',   // Change this!
};
// ─────────────────────────────────────────

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: ADMIN.email });
        if (existing) {
            if (existing.role === 'admin') {
                console.log(`⚠️  Admin already exists: ${ADMIN.email}`);
            } else {
                await User.findByIdAndUpdate(existing._id, { role: 'admin' });
                console.log(`✅ Promoted existing user to admin: ${ADMIN.email}`);
            }
            process.exit(0);
        }

        const hashed = await bcrypt.hash(ADMIN.password, 10);
        await User.create({
            name: ADMIN.name,
            email: ADMIN.email,
            password: hashed,
            role: 'admin',
        });

        console.log('✅ Admin account created successfully!');
        console.log(`   Email   : ${ADMIN.email}`);
        console.log(`   Password: ${ADMIN.password}`);
        console.log('   ⚠️  Change the password after first login!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

createAdmin();
