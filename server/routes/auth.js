import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

export const authRouter = express.Router();

/**
 * Ensures MongoDB is connected before running authentication queries.
 */
async function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  return mongoose.connection.readyState === 1;
}

/**
 * POST /api/auth/register
 * Registers a new student account in MongoDB.
 * Rejects duplicate emails with a 409 status error.
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, passcode, password, branch, rollNo, college, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rawPasscode = passcode || password;

    if (!rawPasscode || rawPasscode.length < 4) {
      return res.status(400).json({ success: false, error: 'Passcode must be at least 4 characters.' });
    }

    const isConnected = await ensureDbConnected();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB database is currently unreachable. Please make sure MongoDB service is running.'
      });
    }

    // Check if account already exists in MongoDB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: `An account with ${normalizedEmail} already exists. Please Sign In with your passcode.`
      });
    }

    const hashedPasscode = await bcrypt.hash(rawPasscode, 10);

    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      passcode: hashedPasscode,
      password: hashedPasscode,
      branch: branch || 'Computer Science & Engineering',
      rollNo: rollNo || '24EG112B25',
      college: college || 'Anurag University',
      role: 'Student',
      avatar: avatar || '/avatars/avatar-1.png',
      avatarInitial: name.trim()[0].toUpperCase(),
      createdAt: new Date()
    };

    let savedUser = null;
    try {
      const newUser = new User(userData);
      await newUser.save();
      savedUser = newUser.toObject();
    } catch (dbErr) {
      console.error('MongoDB save error in /register:', dbErr.message);
      if (dbErr.code === 11000) {
        return res.status(409).json({
          success: false,
          error: `An account with ${normalizedEmail} already exists in database. Please Sign In.`
        });
      }
      return res.status(500).json({
        success: false,
        error: `Database save error: ${dbErr.message}`
      });
    }

    const userPayload = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      branch: savedUser.branch,
      rollNo: savedUser.rollNo,
      college: savedUser.college,
      role: savedUser.role,
      avatar: savedUser.avatar,
      avatarInitial: savedUser.avatarInitial,
      loggedInAt: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered and credentials saved to MongoDB database',
      user: userPayload
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Could not register user.' });
  }
});

/**
 * POST /api/auth/login
 * Verifies credentials against MongoDB database.
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, passcode, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const rawPasscode = passcode || password;
    const normalizedEmail = email.trim().toLowerCase();

    const isConnected = await ensureDbConnected();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB database is currently unreachable. Please make sure MongoDB service is running.'
      });
    }

    const foundUser = await User.findOne({ email: normalizedEmail });

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: `No account registered with ${normalizedEmail}. Please click 'Create Account' first.`
      });
    }

    // Verify hashed passcode
    if (rawPasscode && (foundUser.passcode || foundUser.password)) {
      const hashToCompare = foundUser.passcode || foundUser.password;
      const isMatch = await bcrypt.compare(rawPasscode, hashToCompare).catch(() => false);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect passcode. Please check your credentials and try again.'
        });
      }
    }

    const userPayload = {
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      branch: foundUser.branch || 'Computer Science & Engineering',
      rollNo: foundUser.rollNo || '24EG112B25',
      college: foundUser.college || 'Anurag University',
      role: foundUser.role || 'Student',
      avatar: foundUser.avatar || '/avatars/avatar-1.png',
      avatarInitial: (foundUser.name?.[0] || 'S').toUpperCase(),
      loggedInAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: 'Authenticated successfully from MongoDB database',
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Could not log in.' });
  }
});
