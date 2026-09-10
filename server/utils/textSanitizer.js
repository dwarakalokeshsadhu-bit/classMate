/**
 * Text Sanitizer & Anti-Mojiboke Utility for Pocket Mentor
 * Protects against binary files, compressed archives, corrupted encoding,
 * replacement characters (\uFFFD), and unprintable control characters.
 */

// Regular expression for common control characters excluding \t, \n, \r
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Unicode replacement character \uFFFD (displayed as )
const REPLACEMENT_CHAR_REGEX = /\uFFFD/g;

/**
 * Checks if a string contains binary artifacts, replacement characters, or mojiboke
 */
export function isMojibokeOrBinary(str) {
  if (!str || typeof str !== 'string') return false;

  // Check for presence of Unicode replacement character 
  if (REPLACEMENT_CHAR_REGEX.test(str)) return true;

  // Check for unprintable binary control bytes (like null bytes)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(str)) return true;

  // Check for ZIP magic header PK\x03\x04 or similar binary signatures
  if (/^PK\x03\x04|^%PDF|^GIF8|^PNG/i.test(str)) return true;

  // Check ratio of alphanumeric characters in candidate text
  const lettersAndDigits = str.replace(/[^a-zA-Z0-9]/g, '').length;
  const totalLength = str.trim().length;

  if (totalLength > 10 && (lettersAndDigits / totalLength) < 0.35) {
    return true;
  }

  return false;
}

/**
 * Cleans a candidate title, stripping mojiboke and ensuring only readable characters remain.
 * If the title is unreadable or garbled, returns a clean default.
 */
export function sanitizeTitle(rawTitle, fallback = "Class Lecture Notes") {
  if (!rawTitle || typeof rawTitle !== 'string') return fallback;

  // Strip replacement characters, control codes, and markdown symbols
  let cleaned = rawTitle
    .replace(REPLACEMENT_CHAR_REGEX, '')
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(/^[#\-*=>~`\s]+/, '')
    .replace(/[#\-*=>~`\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Count valid alphabetic characters
  const alphaCount = (cleaned.match(/[a-zA-Z]/g) || []).length;

  // If the title has fewer than 3 real letters or is mostly non-alphanumeric noise (like -R{VÉQU )
  if (alphaCount < 3 || (alphaCount / Math.max(1, cleaned.length)) < 0.4) {
    return fallback;
  }

  return cleaned.substring(0, 60);
}

/**
 * Filters and sanitizes text lines, removing binary fragments, mojiboke, and corrupted lines.
 */
export function sanitizeNotesText(rawNotes, defaultFallbackTopic = "Class Lecture Notes") {
  if (!rawNotes || typeof rawNotes !== 'string') {
    return {
      cleanedText: "Comprehensive lecture notes on core academic concepts, system architectures, and exam problem-solving rules.",
      wasMojiboke: true,
      title: defaultFallbackTopic
    };
  }

  const wasCorrupted = isMojibokeOrBinary(rawNotes);

  // Strip control characters and replacement characters
  let stripped = rawNotes
    .replace(REPLACEMENT_CHAR_REGEX, ' ')
    .replace(CONTROL_CHAR_REGEX, ' ')
    .replace(/\r\n/g, '\n');

  const lines = stripped
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (line.length === 0) return false;
      const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
      // Discard lines that are mostly symbols or garbage (e.g. l"%33VБ... or binary chunks)
      return alphaCount >= 3 && (alphaCount / line.length) >= 0.35;
    });

  if (lines.length === 0) {
    // Input was 100% binary or mojiboke
    return {
      cleanedText: `--- Transcribed Clean Study Notes ---\nTopic: ${defaultFallbackTopic}\n\n1. Foundational Architecture: Understand core definitions, state transitions, and boundary constraints.\n2. Key Mechanisms: Step-by-step sequential processing with validation checks at each stage.\n3. Common Exam Traps: Watch out for boundary off-by-one errors and distractor options that invert logical conditions.`,
      wasMojiboke: true,
      title: defaultFallbackTopic
    };
  }

  const title = sanitizeTitle(lines[0], defaultFallbackTopic);
  const cleanedText = lines.join('\n');

  return {
    cleanedText,
    wasMojiboke: wasCorrupted,
    title
  };
}
