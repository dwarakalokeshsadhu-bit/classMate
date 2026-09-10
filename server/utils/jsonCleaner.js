/**
 * Utility to safely extract and parse JSON from LLM responses,
 * stripping markdown code fences or stray text if present.
 */
export function cleanAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid response received from model.');
  }

  // Trim whitespace
  let cleaned = rawText.trim();

  // Strip markdown code blocks like ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // If there's leading/trailing prose, attempt to find the outer JSON object {...}
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON string:', cleaned);
    throw new Error(`Invalid JSON syntax: ${err.message}`);
  }
}
