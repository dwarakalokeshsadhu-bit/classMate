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
    ? "IMPORTANT: Student requested 'Revise Again'. Generate a COMPLETELY NEW variation of questions and flashcards covering other subtle details, different problem angles, and trickier distractor options directly from the notes."
    : "Generate a comprehensive, high-yield revision suite covering core principles, definitions, edge cases, and exam calculations directly from the notes.";

  const prompt = `You are Pocket Mentor, an elite, hyper-accurate AI academic tutor specializing in university and competitive exam revision.
A student provided raw lecture notes below.

CRITICAL INSTRUCTIONS - 100% NOTE GROUNDING & FIDELITY (MANDATORY):
1. 100% FACTUAL GROUNDING IN PROVIDED NOTES:
   - Every single flashcard, definition, key point, summary sentence, quiz question, distractor, and presentation slide MUST be directly and factually extracted from the provided lecture notes.
   - Use the specific terminology, naming conventions, formulas, theorems, steps, mechanisms, numbers, and examples present in the student's text.
   - Do NOT introduce generic external textbook trivia or broad domain overviews that the student's notes do not cover.

2. ZERO GENERIC META-STUDY BOILERPLATE (STRICTLY FORBIDDEN):
   - ABSOLUTELY DO NOT create flashcards or quiz questions asking about study techniques, active recall, spaced repetition, flashcard methods, or generic test-taking advice (e.g., NEVER ask "Why is active recall good?" or "How should a student study?").
   - Every single question must test the ACTUAL SUBJECT MATTER found in the notes (e.g., biology mechanisms, code logic, math formulas, historical events, physics laws, algorithmic steps, architectural components).

3. Output a single valid JSON object ONLY. No conversational text, no markdown fences.

Strict JSON Output Schema:
{
  "title": "Concise 3-6 word topic title directly naming the subject of the notes",
  "summary": "⚡ 60-Second Rescue Summary (approx 70-110 words, high-density synthesis of the actual facts and core mechanisms from the notes)",
  "deepSummary": "Detailed markdown explanation with headings and bullet points breaking down the specific concepts and rules found in the notes",
  "keyPoints": [
    "High-yield factual takeaway 1 from the notes",
    "High-yield factual takeaway 2 from the notes",
    "High-yield factual takeaway 3 from the notes",
    "High-yield factual takeaway 4 from the notes"
  ],
  "definitions": [
    {
      "term": "Key Concept Term from notes",
      "definition": "Precise, exam-ready definition matching the explanation in the notes",
      "example": "Practical application, example, or formula from the notes"
    }
  ],
  "subtopics": [
    "Specific Subtopic 1 from notes",
    "Specific Subtopic 2 from notes",
    "Specific Subtopic 3 from notes"
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "question": "Specific question testing a fact, formula, step, or definition from the notes",
      "answer": "Accurate, concise answer directly from the notes",
      "topic": "Name of subtopic",
      "difficulty": "easy" // or "medium" or "hard"
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Conceptual multiple-choice question testing a specific concept, formula, mechanism, or distinction from the notes",
      "topic": "Name of subtopic",
      "difficulty": "medium", // "easy", "medium", or "hard"
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact verbatim string of the correct option in the options array",
      "explanation": "Clear explanation citing the exact fact from the notes",
      "distractorsExplanation": "Briefly explain why the other options misstate the notes or confuse related concepts"
    }
  ],
  "presentationSlides": [
    {
      "slideNumber": 1,
      "title": "Slide Title based on notes section",
      "bullets": ["Point 1 from notes", "Point 2 from notes", "Point 3 from notes"],
      "takeaway": "Core takeaway message from notes"
    }
  ],
  "studyTips": [
    "Actionable tip targeting specific difficult concepts or formulas in these notes",
    "Specific tip on how to avoid traps related to these concepts on exams"
  ]
}

Constraints:
1. Generate between 4 to 6 high-yield flashcards directly testing the notes.
2. Generate between 4 to 6 multiple-choice quiz questions with varying difficulties ('easy', 'medium', 'hard') testing the notes.
3. Every quiz question MUST have exactly 4 choices in "options".
4. "correctAnswer" MUST be an exact verbatim match with one of the strings in "options".
5. Ground 100% of the content strictly in the student's lecture notes.
6. Distractors in the quiz MUST be plausible domain-specific misconceptions or contrasting terms related to the notes (NOT generic non-sequiturs).
7. ${variationInstruction}

STUDENT LECTURE NOTES:
"""
${notes}
"""
`;

  try {
    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
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
    contents: prompt,
    config: {
      temperature: 0.2
    }
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
    ],
    config: {
      temperature: 0.1
    }
  });

  return response.text;
}

/**
 * AI Tutor Chatbot with specialized modes & multilingual capability
 */
export async function chatWithGemini(notes, userMessage, history = [], mode = 'default', language = 'English', apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  let modeInstruction = "You are Pocket Mentor, an encouraging, patient, and highly intelligent AI university tutor. Your explanations MUST BE DIRECTLY GROUNDED in the student's uploaded lecture notes.";
  if (mode === 'simple') {
    modeInstruction = "You are Pocket Mentor explaining concepts simply (ELI5 - Explain Like I'm 5). Use vivid analogies, everyday metaphors, and ultra-simple language without confusing jargon, while strictly teaching the concepts from the student's notes.";
  } else if (mode === 'detailed') {
    modeInstruction = "You are a distinguished University Professor providing an in-depth, rigorous, mathematically and conceptually thorough academic analysis of the specific topics and mechanisms in the student's lecture notes.";
  } else if (mode === 'examples') {
    modeInstruction = "Provide 2 to 3 vivid, concrete, real-world examples showing how the specific concepts, algorithms, or formulas mentioned in the student's notes operate in modern industry, software, or science.";
  } else if (mode === 'common_mistakes') {
    modeInstruction = "Highlight the most common mistakes, misconceptions, and exam trap questions students encounter regarding the specific concepts in these notes, and show how to avoid them.";
  } else if (mode === 'diagram') {
    modeInstruction = "Generate a clear, intuitive ASCII or text-based architecture diagram or flowchart illustrating the core concept, its variables, and step-by-step state transitions directly from the notes.";
  } else if (mode === 'source') {
    modeInstruction = "You are Pocket Mentor answering questions directly grounded in the student's uploaded lecture notes. Quote or cite the exact relevant points/lines from the student's notes, and state explicitly what is in the notes versus any external deduction.";
  } else if (mode === 'follow_up') {
    modeInstruction = "You are Pocket Mentor generating high-yield follow-up revision questions based on the topic and the student's question. Provide 3 probing conceptual questions that test edge cases from these notes, plus brief hints for each.";
  }

  const prompt = `${modeInstruction}

IMPORTANT LANGUAGE REQUIREMENT: Respond in ${language || 'English'}. If the student asks for a language other than English, provide the entire explanation fluently in that language.

STUDENT'S UPLOADED LECTURE NOTES (Your primary factual ground truth):
"""
${notes}
"""

STUDENT'S QUESTION / MESSAGE:
"""
${userMessage}
"""
`;

  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      temperature: 0.2
    }
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
Tailor the tasks and themes specifically to the content and terminology of the student's lecture notes provided below.

Output a single valid JSON object ONLY:
{
  "examDate": "${examDateStr}",
  "daysRemaining": ${daysLeft},
  "totalRevisionMinutes": 120,
  "recommendation": "High-level strategic guidance tailored to the topic",
  "schedule": [
    {
      "day": 1,
      "title": "Theme for Day 1 based on notes",
      "tasks": ["Specific task 1 referencing notes content", "Specific task 2"],
      "estimatedMinutes": 25
    }
  ]
}

LECTURE NOTES CONTEXT:
"""
${notes.slice(0, 2000)}
"""
`;

  try {
    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    return cleanAndParseJSON(response.text);
  } catch (err) {
    console.warn('Falling back to local study plan:', err.message);
    throw err;
  }
}
