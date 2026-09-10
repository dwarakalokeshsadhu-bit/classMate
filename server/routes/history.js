import express from 'express';
import mongoose from 'mongoose';
import { NoteHistory } from '../models/NoteHistory.js';
import { requireAuth } from '../middleware/auth.js';

export const historyRouter = express.Router();

// Require valid JWT authentication across all history endpoints
historyRouter.use(requireAuth);

// Resilient in-memory fallback store for offline/demo operation
const inMemoryHistory = [];

/**
 * POST /api/history
 * Saves a generated notes session and revision tools to history.
 * Scoped to the authenticated student's session.
 */
historyRouter.post('/', async (req, res) => {
  try {
    const { subject, title, rawNotes, studyData } = req.body;
    const authenticatedEmail = req.user.email.trim().toLowerCase();

    if (!rawNotes || typeof rawNotes !== 'string') {
      return res.status(400).json({ success: false, error: 'Raw notes content is required.' });
    }

    const noteRecord = {
      email: authenticatedEmail,
      subject: subject || 'General',
      title: title || studyData?.title || 'Class Lecture Notes',
      rawNotes: rawNotes.trim(),
      studyData: studyData || {},
      flashcardsCount: Array.isArray(studyData?.flashcards) ? studyData.flashcards.length : 0,
      quizCount: Array.isArray(studyData?.quiz) ? studyData.quiz.length : 0,
      definitionsCount: Array.isArray(studyData?.definitions) ? studyData.definitions.length : 0,
      createdAt: new Date()
    };

    let savedItem = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const historyDoc = new NoteHistory(noteRecord);
        await historyDoc.save();
        savedItem = historyDoc.toObject();
      } catch (dbErr) {
        console.warn('MongoDB note history save warning:', dbErr.message);
      }
    }

    if (!savedItem) {
      savedItem = {
        _id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...noteRecord
      };
    }

    // Add to in-memory queue (keep latest 100 items)
    inMemoryHistory.unshift(savedItem);
    if (inMemoryHistory.length > 100) inMemoryHistory.pop();

    return res.status(201).json({
      success: true,
      message: 'Generated notes saved to history',
      item: savedItem
    });
  } catch (err) {
    console.error('History save error:', err);
    return res.status(500).json({ success: false, error: 'Could not save note to history.' });
  }
});

/**
 * GET /api/history
 * Retrieves history of generated notes for the authenticated student.
 */
historyRouter.get('/', async (req, res) => {
  try {
    const authenticatedEmail = req.user.email.trim().toLowerCase();
    let items = [];

    if (mongoose.connection.readyState === 1) {
      try {
        items = await NoteHistory.find({ email: authenticatedEmail }).sort({ createdAt: -1 }).limit(50).lean();
      } catch (dbErr) {
        console.warn('MongoDB history query warning:', dbErr.message);
      }
    }

    // If DB returned nothing or wasn't connected, check in-memory store
    if (!items || items.length === 0) {
      items = inMemoryHistory.filter(h => h.email === authenticatedEmail);
    }

    return res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch history.' });
  }
});

/**
 * DELETE /api/history/:id
 * Deletes a note history record by ID if owned by the authenticated student.
 */
historyRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedEmail = req.user.email.trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          await NoteHistory.findOneAndDelete({ _id: id, email: authenticatedEmail });
        }
      } catch (dbErr) {
        console.warn('MongoDB delete warning:', dbErr.message);
      }
    }

    const idx = inMemoryHistory.findIndex(h => String(h._id) === String(id) && h.email === authenticatedEmail);
    if (idx !== -1) {
      inMemoryHistory.splice(idx, 1);
    }

    return res.json({
      success: true,
      message: 'History item removed'
    });
  } catch (err) {
    console.error('History delete error:', err);
    return res.status(500).json({ success: false, error: 'Could not delete history item.' });
  }
});

