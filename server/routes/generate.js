import express from 'express';
import {
  generateWithGemini,
  cleanNotesWithGemini,
  ocrImageWithGemini,
  chatWithGemini,
  generateStudyPlanWithGemini
} from '../services/geminiService.js';
import {
  generateMockRevision,
  cleanMockNotes,
  ocrMockImage,
  chatMockTutor,
  mockStudyPlan
} from '../services/mockService.js';
import { sanitizeNotesText } from '../utils/textSanitizer.js';

const router = express.Router();

/**
 * Helper to check whether a real Gemini API key is present
 */
function hasValidApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 10 && apiKey !== 'your_gemini_api_key_here');
}

/**
 * POST /api/generate
 * Main study generator: 60s summary, deep summary, key points, definitions, flashcards, quiz, presentation
 */
router.post('/', async (req, res) => {
  try {
    const { notes, mode } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 10 characters of readable notes to generate revision tools.'
      });
    }

    // Sanitize against mojiboke, binary artifacts, replacement characters (\uFFFD)
    const { cleanedText, wasMojiboke, title } = sanitizeNotesText(notes, "Class Lecture Notes");

    if (cleanedText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'The provided notes contain unreadable binary or corrupted characters. Please provide readable text.'
      });
    }

    const trimmedNotes = cleanedText.trim();
    let result;

    if (hasValidApiKey()) {
      try {
        result = await generateWithGemini(trimmedNotes, process.env.GEMINI_API_KEY, mode);
      } catch (geminiError) {
        console.warn('Gemini invocation failed, falling back to smart demo engine:', geminiError.message);
        result = generateMockRevision(trimmedNotes, mode);
        result.warning = `AI provider notice: ${geminiError.message}. Served using Pocket Mentor offline engine.`;
      }
    } else {
      result = generateMockRevision(trimmedNotes, mode);
    }

    if (wasMojiboke && !result.warning) {
      result.warning = 'Cleaned binary encoding / mojiboke characters from uploaded notes to ensure accurate revision materials.';
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Server error in /api/generate:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while generating study materials.'
    });
  }
});

/**
 * POST /api/generate/clean
 * AI notes cleanup & organization into structured Markdown
 */
router.post('/clean', async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || typeof notes !== 'string' || notes.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please provide notes to clean.' });
    }

    let cleanedText;
    if (hasValidApiKey()) {
      try {
        cleanedText = await cleanNotesWithGemini(notes, process.env.GEMINI_API_KEY);
      } catch (err) {
        cleanedText = cleanMockNotes(notes);
      }
    } else {
      cleanedText = cleanMockNotes(notes);
    }

    return res.json({ success: true, cleanedNotes: cleanedText });
  } catch (err) {
    console.error('Error in /api/generate/clean:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/generate/ocr
 * Handwritten notes OCR / Image extraction
 */
router.post('/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType, fileName } = req.body;

    let extractedText;
    if (hasValidApiKey() && imageBase64) {
      try {
        extractedText = await ocrImageWithGemini(imageBase64, mimeType || 'image/jpeg', process.env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('Gemini OCR failed, using fallback mock OCR:', err.message);
        extractedText = ocrMockImage(fileName);
      }
    } else {
      extractedText = ocrMockImage(fileName);
    }

    return res.json({ success: true, extractedText });
  } catch (err) {
    console.error('Error in /api/generate/ocr:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/generate/chat
 * AI Tutor Chatbot with "Explain Simply", "Explain in Detail", Examples, Common Mistakes, and Diagram modes
 */
router.post('/chat', async (req, res) => {
  try {
    const { notes, message, userMessage, query, history, mode, language } = req.body;
    const actualMessage = (message || userMessage || query || '').trim();

    if (!actualMessage) {
      return res.status(400).json({ success: false, error: 'A question or message is required.' });
    }

    let answer;
    if (hasValidApiKey()) {
      try {
        answer = await chatWithGemini(notes || '', actualMessage, history || [], mode || 'default', language || 'English', process.env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('Gemini chat failed, using local tutor engine:', err.message);
        answer = chatMockTutor(notes || '', actualMessage, history || [], mode || 'default', language || 'English');
      }
    } else {
      answer = chatMockTutor(notes || '', actualMessage, history || [], mode || 'default', language || 'English');
    }

    return res.json({ success: true, response: answer, reply: answer });
  } catch (err) {
    console.error('Error in /api/generate/chat:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/generate/study-plan
 * Personalized Study Plan & Exam Countdown Planner
 */
router.post('/study-plan', async (req, res) => {
  try {
    const { notes, examDate, daysLeft, weakTopics } = req.body;

    let plan;
    if (hasValidApiKey()) {
      try {
        plan = await generateStudyPlanWithGemini(notes || '', examDate, daysLeft, weakTopics || [], process.env.GEMINI_API_KEY);
      } catch (err) {
        plan = mockStudyPlan(notes || '', examDate, daysLeft, weakTopics || []);
      }
    } else {
      plan = mockStudyPlan(notes || '', examDate, daysLeft, weakTopics || []);
    }

    return res.json({ success: true, plan });
  } catch (err) {
    console.error('Error in /api/generate/study-plan:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
