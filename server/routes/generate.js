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
import { sanitizeNotesText, cleanLatexMathFormatting } from '../utils/textSanitizer.js';

const router = express.Router();

/**
 * Helper to check whether a real Gemini API key is present
 */
function hasValidApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 10 && apiKey !== 'your_gemini_api_key_here');
}

/**
 * Classifies a Gemini OCR failure into a user-facing warning message.
 * Distinguishes "unsupported file type" from other transient failures (rate limit,
 * network, etc.), defaulting safely to a generic message if the heuristic doesn't match.
 */
function describeOcrFailure(err, mimeType) {
  const rawMessage = (err && err.message) || '';
  const status = err && err.status;

  // @google/genai's ApiError.message is JSON.stringify({ error: { message, code, status } })
  // per the SDK's error handling — try to unwrap for a more precise inner message; fall back
  // to the raw text for non-ApiError errors (network/timeout), which aren't JSON.
  let innerMessage = rawMessage;
  try {
    const parsed = JSON.parse(rawMessage);
    innerMessage = (parsed && parsed.error && parsed.error.message) || rawMessage;
  } catch (_) {
    // not JSON — use rawMessage as-is
  }

  const unsupportedTypePatterns = [
    /unsupported/i,
    /invalid.*(mime|media|file).*type/i,
    /(mime|media).*type.*not.*(supported|valid)/i,
    /invalid_argument/i
  ];
  const looksUnsupportedType =
    unsupportedTypePatterns.some((re) => re.test(innerMessage)) &&
    (status === undefined || status === 400);

  if (looksUnsupportedType) {
    return `This file format${mimeType ? ` (${mimeType})` : ''} isn't supported for AI transcription. PowerPoint, Word, and Excel files can't be read by the AI model directly — try exporting as PDF, or use .pptx/.docx instead. Showing example demo content below instead of a real transcription.`;
  }

  return `AI transcription is temporarily unavailable right now${status ? ` (error ${status})` : ''}. Showing example demo content below instead of a real transcription.`;
}

/**
 * Gemini's inlineData/document-understanding API does not support Office Open XML or
 * legacy binary Office formats (PowerPoint/Word/Excel) — and, confirmed via live testing, it
 * does NOT reliably throw an error for these either: it can "succeed" while returning a
 * confused, useless response instead (it may partially read raw XML bytes as text without
 * recognizing the file as a real document). So this is checked proactively before ever
 * calling Gemini, rather than relying on Gemini to fail loudly.
 */
const UNSUPPORTED_OCR_MIME_PATTERNS = [
  /^application\/vnd\.openxmlformats-officedocument\.presentationml/i, // .pptx
  /^application\/vnd\.ms-powerpoint$/i, // .ppt
  /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml/i, // .docx
  /^application\/msword$/i, // .doc
  /^application\/vnd\.openxmlformats-officedocument\.spreadsheetml/i, // .xlsx
  /^application\/vnd\.ms-excel$/i // .xls
];

function isUnsupportedOcrMimeType(mimeType) {
  return Boolean(mimeType) && UNSUPPORTED_OCR_MIME_PATTERNS.some((re) => re.test(mimeType));
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
        console.warn('[AI Service] Gemini request failed, using high-yield offline study engine:', geminiError.message);
        result = generateMockRevision(trimmedNotes, mode);
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
    const { imageBase64, mimeType, fileName, subject } = req.body;

    if (!imageBase64 && !fileName) {
      return res.status(400).json({ success: false, error: 'No image data or filename provided.' });
    }

    let resolvedMime = (mimeType || '').trim();
    if (!resolvedMime || resolvedMime === 'application/octet-stream' || resolvedMime === 'image/jpeg') {
      const ext = (fileName || '').split('.').pop()?.toLowerCase();
      if (ext === 'pdf') resolvedMime = 'application/pdf';
      else if (ext === 'png') resolvedMime = 'image/png';
      else if (ext === 'webp') resolvedMime = 'image/webp';
      else if (ext === 'gif') resolvedMime = 'image/gif';
      else if (ext === 'bmp') resolvedMime = 'image/bmp';
      else if (ext === 'jpg' || ext === 'jpeg') resolvedMime = 'image/jpeg';
    }
    if (!resolvedMime) resolvedMime = 'image/jpeg';

    let extractedText;
    let warning;

    if (isUnsupportedOcrMimeType(resolvedMime)) {
      extractedText = ocrMockImage(fileName, subject);
      warning = `This file format (${resolvedMime}) isn't supported for AI transcription. PowerPoint, Word, and Excel files can't be read by the AI model directly — try exporting as PDF, or use .pptx/.docx instead. Showing example demo content below instead of a real transcription.`;
    } else if (hasValidApiKey() && imageBase64) {
      try {
        extractedText = await ocrImageWithGemini(imageBase64, resolvedMime, process.env.GEMINI_API_KEY);
      } catch (err) {
        console.warn('Gemini OCR failed, using fallback mock OCR:', err.message);
        extractedText = ocrMockImage(fileName, subject);
        warning = describeOcrFailure(err, resolvedMime);
      }
    } else if (!hasValidApiKey()) {
      extractedText = ocrMockImage(fileName, subject);
      warning = 'Demo mode: no Gemini API key is configured, so this is sample transcription content, not a real reading of your file.';
    } else {
      // hasValidApiKey() is true but no imageBase64 was provided in the request
      extractedText = ocrMockImage(fileName, subject);
      warning = 'No file data was received by the server, so this is sample demo content rather than a real transcription.';
    }

    const responsePayload = { success: true, extractedText: cleanLatexMathFormatting(extractedText) };
    if (warning) responsePayload.warning = warning;
    return res.json(responsePayload);
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
