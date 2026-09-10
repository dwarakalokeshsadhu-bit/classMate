import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: false, // Explicitly non-unique to allow multiple registrations with the same email
    index: true
  },
  password: {
    type: String,
    required: false
  },
  branch: {
    type: String,
    default: 'Computer Science & Engineering'
  },
  rollNo: {
    type: String,
    default: '24EG112B25'
  },
  college: {
    type: String,
    default: 'Anurag University'
  },
  role: {
    type: String,
    default: 'Student'
  },
  avatar: {
    type: String,
    default: '/avatars/avatar-1.png'
  },
  streak: {
    type: Number,
    default: 1 // Start at Day 1 for all new accounts!
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
