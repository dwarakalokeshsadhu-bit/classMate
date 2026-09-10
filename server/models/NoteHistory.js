import mongoose from 'mongoose';

const NoteHistorySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  subject: {
    type: String,
    default: 'General'
  },
  title: {
    type: String,
    default: 'Class Notes'
  },
  rawNotes: {
    type: String,
    required: true
  },
  studyData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  flashcardsCount: {
    type: Number,
    default: 0
  },
  quizCount: {
    type: Number,
    default: 0
  },
  definitionsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const NoteHistory = mongoose.models.NoteHistory || mongoose.model('NoteHistory', NoteHistorySchema);
