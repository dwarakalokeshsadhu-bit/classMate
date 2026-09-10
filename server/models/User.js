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
    unique: true,
    index: true
  },
  passcode: {
    type: String,
    required: true,
    minlength: 4
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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
