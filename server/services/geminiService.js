import { GoogleGenAI } from '@google/genai';
import { cleanAndParseJSON } from '../utils/jsonCleaner.js';

// Candidate models in preference order (as instructed by Gemini API notice)
const GEMINI_CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash'
].filter(Boolean);

/**
 * Executes a Gemini request with automatic multi-model fallback
 */
async function generateWithFallback(ai, requestOptions) {
  let lastError;
  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...requestOptions,
        model
      });
      return response;
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini API] Model '${model}' failed: ${err.message}. Trying next candidate model...`);
    }
  }
  throw lastError || new Error('All candidate Gemini models failed.');
}

/**
 * Live Gemini generative engine for Pocket Mentor
 */
export async function generateWithGemini(notes, apiKey, mode = 'fresh') {
  const ai = new GoogleGenAI({ apiKey });

  const variationInstruction = mode === 'variation'
    ? "IMPORTANT: Student requested 'Revise Again'. Generate a COMPLETELY NEW variation of questions and flashcards covering other subtle details, different problem angles, and trickier distractor options."
    : "Generate a comprehensive, high-yield revision suite covering core principles, definitions, edge cases, and exam calculations.";

  const prompt = `You are Pocket Mentor, an elite AI tutor specializing in university and competitive exam revision.
A student provided raw, unstructured lecture notes below.

Your mission:
Transform these notes into high-retention study resources adhering strictly to cognitive learning principles (active recall, spaced repetition, concept triage).

Output a single valid JSON object ONLY. No conversational text, no markdown fences.

Strict JSON Output Schema:
{
  "title": "Concise 3-6 word topic title",
  "summary": "⚡ 60-Second Rescue Summary (approx 70-110 words, concise, high-yield)",
  "deepSummary": "Detailed markdown explanation with headings and bullet points",
  "keyPoints": [
    "High-yield takeaway 1",
    "High-yield takeaway 2",
    "High-yield takeaway 3",
    "High-yield takeaway 4"
  ],
  "definitions": [
    {
      "term": "Key Concept Term",
      "definition": "Precise, exam-ready definition",
      "example": "Brief practical or exam application"
    }
  ],
  "subtopics": [
    "Subtopic 1",
    "Subtopic 2",
    "Subtopic 3"
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "question": "Concise active-recall question (test understanding, not recognition)",
      "answer": "Clear, accurate answer",
      "topic": "Name of subtopic",
      "difficulty": "easy" // or "medium" or "hard"
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Conceptual multiple-choice question testing understanding or edge cases",
      "topic": "Name of subtopic",
      "difficulty": "medium", // "easy", "medium", or "hard"
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact verbatim string of the correct option in the options array",
      "explanation": "Clear explanation why this option is correct",
      "distractorsExplanation": "Briefly explain why the other options are wrong or common misconceptions"
    }
  ],
  "presentationSlides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "takeaway": "Core takeaway message"
    }
  ],
  "studyTips": [
    "Tip 1 for conquering this topic on exam day",
    "Tip 2"
  ]
}

Constraints:
1. Generate between 4 to 6 high-yield flashcards.
2. Generate between 4 to 6 multiple-choice quiz questions with varying difficulties ('easy', 'medium', 'hard').
3. Every quiz question MUST have exactly 4 choices in "options".
4. "correctAnswer" MUST be an exact verbatim match with one of the strings in "options".
5. Ground everything strictly in the student's lecture notes.
6. ${variationInstruction}

STUDENT LECTURE NOTES:
"""
${notes}
"""
`;

  try {
    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = cleanAndParseJSON(response.text);

    if (!parsed.summary || !Array.isArray(parsed.flashcards) || !Array.isArray(parsed.quiz)) {
      throw new Error('LLM response missing required properties.');
    }

    return {
      ...parsed,
      source: 'gemini-live'
    };
  } catch (error) {
    console.error('Gemini API Error in generateWithGemini:', error.message);
    throw error;
  }
}

/**
 * AI Notes Cleanup & Organization
 */
export async function cleanNotesWithGemini(rawNotes, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are Pocket Mentor's AI Notes Cleaner.
A student gave you raw, fragmented, messy lecture notes.
Clean, organize, format, and structure these notes into elegant, high-yield Markdown notes.
Include:
# 📚 [Topic Title]
## 🎯 Overview & Objectives
## 🔑 Key Concepts & Definitions
## ⚙️ Operational Mechanisms & Rules
## ⚠️ Common Pitfalls & Edge Cases
## ⚡ Quick Formula / Revision Checklist

Do not lose any factual detail from the original notes, but remove typos, fragmented sentences, and disorganization.

RAW NOTES:
"""
${rawNotes}
"""
`;

  const response = await generateWithFallback(ai, {
    contents: prompt
  });

  return response.text;
}

/**
 * Handwritten Notes OCR via Gemini Multimodal Vision
 */
export async function ocrImageWithGemini(imageBase64, mimeType = 'image/jpeg', apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are Pocket Mentor's Document & Handwritten Notes OCR Specialist.
Transcribe and extract the text from this uploaded document or image of handwritten/printed lecture notes.
Clean up the handwriting or document content into clear, organized, well-formatted study notes with headers and bullets.
If equations, diagrams, or arrows exist, transcribe them clearly in text or markdown notation.`;

  const response = await generateWithFallback(ai, {
    contents: [
      {
        inlineData: {
          mimeType,
          data: imageBase64
        }
      },
      { text: prompt }
    ]
  });

  return response.text;
}

/**
 * AI Tutor Chatbot with specialized modes & multilingual capability
 */
export async function chatWithGemini(notes, userMessage, history = [], mode = 'default', language = 'English', apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  let modeInstruction = "You are Pocket Mentor, an encouraging, patient, and highly intelligent AI university tutor.";
  if (mode === 'simple') {
    modeInstruction = "You are Pocket Mentor explaining concepts simply (ELI5 - Explain Like I'm 5). Use vivid analogies, everyday metaphors, and ultra-simple language without confusing jargon.";
  } else if (mode === 'detailed') {
    modeInstruction = "You are a distinguished University Professor providing an in-depth, rigorous, mathematically and conceptually thorough academic analysis of the topic.";
  } else if (mode === 'examples') {
    modeInstruction = "Provide 2 to 3 vivid, concrete, real-world examples showing how this topic or mechanism operates in modern industry, software, or nature.";
  } else if (mode === 'common_mistakes') {
    modeInstruction = "Highlight the most common mistakes, misconceptions, and trap questions students encounter on exams regarding this topic, and show exactly how to avoid them.";
  } else if (mode === 'diagram') {
    modeInstruction = "Generate a clear, intuitive ASCII or text-based architecture diagram or flowchart illustrating the core concept and its step-by-step state transitions.";
  } else if (mode === 'source') {
    modeInstruction = "You are Pocket Mentor answering questions directly grounded in the student's uploaded lecture notes. Quote or cite the exact relevant points/lines from the student's notes, and state explicitly what is in the notes versus any external deduction.";
  } else if (mode === 'follow_up') {
    modeInstruction = "You are Pocket Mentor generating high-yield follow-up revision questions based on the topic and the student's question. Provide 3 probing conceptual questions that test edge cases, plus brief hints for each.";
  }

  const prompt = `${modeInstruction}

IMPORTANT LANGUAGE REQUIREMENT: Respond in ${language || 'English'}. If the student asks for a language other than English, provide the entire explanation fluently in that language.

STUDENT'S UPLOADED LECTURE NOTES (Use as your primary truth grounding):
"""
${notes}
"""

STUDENT'S QUESTION / MESSAGE:
"""
${userMessage}
"""
`;

  const response = await generateWithFallback(ai, {
    contents: prompt
  });

  return response.text;
}

/**
 * Personalized Study Plan via Gemini
 */
export async function generateStudyPlanWithGemini(notes, examDateStr, daysLeft, weakTopics, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are Pocket Mentor's Academic Strategy Advisor.
Create a personalized, day-by-day revision study plan for a student with an exam in ${daysLeft} days (Date: ${examDateStr}).
The student has weak topics identified: ${weakTopics.join(', ') || 'General fundamentals'}.

Output a single valid JSON object ONLY:
{
  "examDate": "${examDateStr}",
  "daysRemaining": ${daysLeft},
  "totalRevisionMinutes": 120,
  "recommendation": "High-level strategic guidance",
  "schedule": [
    {
      "day": 1,
      "title": "Theme for Day 1",
      "tasks": ["Task 1", "Task 2"],
      "estimatedMinutes": 25
    }
  ]
}

LECTURE NOTES CONTEXT:
"""
${notes.slice(0, 1500)}
"""
`;

  try {
    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return cleanAndParseJSON(response.text);
  } catch (err) {
    console.warn('Falling back to local study plan:', err.message);
    throw err;
  }
}
