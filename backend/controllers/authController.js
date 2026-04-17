const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ─── Roll Number Parser ────────────────────────────────────────────────────
// Format: YY 48 BBBB SS  (total 10 chars, e.g. 23481A05F8)
//   YY   = 2-digit admission year (22, 23, 24, 25 ...)
//   48   = college code (must be exactly "48")
//   BBBB = 4-char branch code  (e.g. 1A05)
//   SS   = 2-char roll sequence (e.g. F8, G0)

const COLLEGE_CODE = '48';

// Map known branch codes → readable names (extend as needed)
const BRANCH_NAMES = {
    '1A05': 'CSE',
    '1A01': 'Civil Engineering',
    '1A02': 'EEE',
    '1A03': 'Mechanical Engineering',
    '1A04': 'ECE',
    '1A06': 'IT',
    '1A12': 'CSE (AI & ML)',
    '1A21': 'CSE (Data Science)',
};

const parseRollNumber = (roll) => {
    const r = roll.toUpperCase().trim();
    // Must be exactly 10 alphanumeric characters
    if (!/^[A-Z0-9]{10}$/.test(r)) {
        console.log(`[auth] Roll failed regex: ${r}`);
        return null;
    }

    const admYear    = r.slice(0, 2);   // e.g. "23"
    const college    = r.slice(2, 4);   // e.g. "48"
    const branchCode = r.slice(4, 8);   // e.g. "1A05"

    if (college !== COLLEGE_CODE) {
        console.log(`[auth] Invalid college code: ${college} (expected ${COLLEGE_CODE})`);
        return null;
    }

    // Derive current academic year (India: session June-June)
    const now          = new Date();
    const currentYear  = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    // In April (4), the session is still the one that started in June (Year-1)
    const academicYear = currentMonth >= 6 ? currentYear : currentYear - 1;
    const yearOfStudy  = (academicYear - parseInt(admYear, 10)) + 1;

    // Allow years 1 to 5 to cover batch 21 students finishing their 4th year in April/May
    if (yearOfStudy < 1 || yearOfStudy > 5) {
        console.log(`[auth] Roll batch out of range: ${admYear} (yearOfStudy: ${yearOfStudy})`);
        return null;
    }

    const branchName = BRANCH_NAMES[branchCode] || branchCode;

    return { admYear, branchCode, branchName, yearOfStudy: String(yearOfStudy), rollNumber: r };
};

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role, rollNumber, department } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // coordinator → pending until admin approves
        const allowedRoles = ['student', 'coordinator'];
        const userRole = allowedRoles.includes(role)
            ? (role === 'coordinator' ? 'pending' : 'student')
            : 'student';

        // ── Roll number mandatory for students ──
        let parsedRoll = null;
        if (userRole === 'student') {
            if (!rollNumber) {
                return res.status(400).json({ message: 'Roll number is required for student registration.' });
            }
            parsedRoll = parseRollNumber(rollNumber);
            if (!parsedRoll) {
                return res.status(400).json({
                    message: `Invalid roll number. Must be 10 characters with college code "${COLLEGE_CODE}" (e.g. 23481A05F8). Only students of this college can register.`
                });
            }
            const rollExists = await User.findOne({ rollNumber: parsedRoll.rollNumber });
            if (rollExists) {
                return res.status(409).json({ message: `Roll number ${parsedRoll.rollNumber} is already registered to another account.` });
            }
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: `Email address ${email} is already registered. Please login instead.` });
        }

        const hashed = await bcrypt.hash(password, 10);
        const userData = { name, email, password: hashed, role: userRole };

        if (userRole === 'student' && parsedRoll) {
            userData.rollNumber = parsedRoll.rollNumber;
            userData.studentId  = parsedRoll.rollNumber;
            userData.year       = parsedRoll.yearOfStudy;
            userData.branch     = `${parsedRoll.branchCode} - ${parsedRoll.branchName}`;
            userData.department = department || parsedRoll.branchName;
        }

        const newUser = await User.create(userData);
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                ...(parsedRoll ? {
                    rollNumber: newUser.rollNumber,
                    year: newUser.year,
                    branch: newUser.branch,
                } : {})
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

        const token = generateToken(user);
        res.json({
            message: 'Login successful.',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { register, login, getMe };
