import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

export const authRouter = express.Router();

/**
 * POST /api/auth/register
 * Registers a new student account (accepts existing/same email without error)
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, branch, rollNo, college, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'default123',
      branch: branch || 'Computer Science & Engineering',
      rollNo: rollNo || '24EG112B25',
      college: college || 'Anurag University',
      role: 'Student',
      avatar: avatar || '/avatars/avatar-1.png',
      avatarInitial: name.trim()[0].toUpperCase(),
      streak: 1, // New accounts start at Day 1
      loggedInAt: new Date().toISOString()
    };

    // If MongoDB Atlas is connected, save into cluster
    if (mongoose.connection.readyState === 1) {
      const newUser = new User(userData);
      await newUser.save();
      userData._id = newUser._id;
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userData
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Could not register user.' });
  }
});

/**
 * POST /api/auth/login
 * Logs in a user by email or creates a session
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    let foundUser = null;
    if (mongoose.connection.readyState === 1) {
      // Find latest registered user with this email
      foundUser = await User.findOne({ email: email.trim().toLowerCase() }).sort({ createdAt: -1 });
    }

    const guessedName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = guessedName.charAt(0).toUpperCase() + guessedName.slice(1);

    const userPayload = foundUser ? {
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      branch: foundUser.branch,
      rollNo: foundUser.rollNo,
      college: foundUser.college,
      role: foundUser.role,
      avatar: foundUser.avatar || '/avatars/avatar-1.png',
      avatarInitial: (foundUser.name[0] || 'S').toUpperCase(),
      streak: foundUser.streak || 1,
      loggedInAt: new Date().toISOString()
    } : {
      name: formattedName || 'Student',
      email: email.trim().toLowerCase(),
      branch: 'Computer Science & Engineering',
      rollNo: '24EG112B25',
      college: 'Anurag University',
      role: 'Student',
      avatar: '/avatars/avatar-1.png',
      avatarInitial: (formattedName[0] || 'S').toUpperCase(),
      streak: 1,
      loggedInAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Could not log in.' });
  }
});
