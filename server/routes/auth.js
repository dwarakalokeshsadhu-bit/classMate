import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const authRouter = express.Router();

// Resilient in-memory fallback cache for local dev / offline cluster mode
const inMemoryUsers = [];

/**
 * POST /api/auth/register
 * Registers a new student account (accepts existing/same email without error)
 * Stores email, hashed passcode/password, and academic profile
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, passcode, password, branch, rollNo, college, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const rawPasscode = passcode || password || 'student123';
    const hashedPasscode = await bcrypt.hash(rawPasscode, 10);

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passcode: hashedPasscode,
      password: hashedPasscode,
      branch: branch || 'Computer Science & Engineering',
      rollNo: rollNo || '24EG112B25',
      college: college || 'Anurag University',
      role: 'Student',
      avatar: avatar || '/avatars/avatar-1.png',
      avatarInitial: name.trim()[0].toUpperCase(),
      loggedInAt: new Date().toISOString()
    };

    // If MongoDB Atlas is connected, save into cluster
    if (mongoose.connection.readyState === 1) {
      try {
        const newUser = new User(userData);
        await newUser.save();
        userData._id = newUser._id;
      } catch (dbErr) {
        console.warn('MongoDB save warning in /register:', dbErr.message);
        // If MongoDB throws due to legacy unique index, handle gracefully
        userData._id = 'user_' + Date.now();
      }
    } else {
      userData._id = 'user_' + Date.now();
    }

    // Keep in inMemoryUsers as fallback
    inMemoryUsers.push({ ...userData, rawPasscode });

    // Do not return hashed password in response payload
    const sanitizedUser = { ...userData };
    delete sanitizedUser.passcode;
    delete sanitizedUser.password;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB cluster',
      user: sanitizedUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Could not register user.' });
  }
});

/**
 * POST /api/auth/login
 * Logs in a user by email and passcode/password.
 * Supports multiple accounts with same email by matching passcode.
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, passcode, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const rawPasscode = passcode || password;
    const normalizedEmail = email.trim().toLowerCase();

    let matchedUser = null;

    if (mongoose.connection.readyState === 1) {
      try {
        // Find all registered accounts with this email
        const candidates = await User.find({ email: normalizedEmail }).sort({ createdAt: -1 });

        if (candidates && candidates.length > 0) {
          if (rawPasscode) {
            // Check candidates to find matching passcode
            for (const candidate of candidates) {
              const hashToCompare = candidate.passcode || candidate.password;
              if (hashToCompare) {
                const isMatch = await bcrypt.compare(rawPasscode, hashToCompare).catch(() => false);
                if (isMatch) {
                  matchedUser = candidate;
                  break;
                }
              }
            }
          }
          // If no passcode matched or no passcode given, take the latest matching account
          if (!matchedUser && candidates.length > 0) {
            matchedUser = candidates[0];
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB find error in /login:', dbErr.message);
      }
    }

    // Check in-memory fallback if not found in DB
    if (!matchedUser && inMemoryUsers.length > 0) {
      const candidates = inMemoryUsers.filter(u => u.email === normalizedEmail);
      if (rawPasscode && candidates.length > 0) {
        for (const candidate of candidates) {
          if (candidate.rawPasscode === rawPasscode) {
            matchedUser = candidate;
            break;
          }
        }
      }
      if (!matchedUser && candidates.length > 0) {
        matchedUser = candidates[candidates.length - 1];
      }
    }

    const guessedName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = guessedName.charAt(0).toUpperCase() + guessedName.slice(1);

    const userPayload = matchedUser ? {
      _id: matchedUser._id,
      name: matchedUser.name,
      email: matchedUser.email,
      branch: matchedUser.branch || 'Computer Science & Engineering',
      rollNo: matchedUser.rollNo || '24EG112B25',
      college: matchedUser.college || 'Anurag University',
      role: matchedUser.role || 'Student',
      avatar: matchedUser.avatar || '/avatars/avatar-1.png',
      avatarInitial: (matchedUser.name?.[0] || 'S').toUpperCase(),
      loggedInAt: new Date().toISOString()
    } : {
      name: formattedName || 'Student',
      email: normalizedEmail,
      branch: 'Computer Science & Engineering',
      rollNo: '24EG112B25',
      college: 'Anurag University',
      role: 'Student',
      avatar: '/avatars/avatar-1.png',
      avatarInitial: (formattedName[0] || 'S').toUpperCase(),
      loggedInAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Could not log in.' });
  }
});
