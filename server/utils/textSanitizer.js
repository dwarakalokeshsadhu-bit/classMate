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
 * Checks if a line is an OCR/file wrapper banner or pure divider noise
 */
export function isBannerOrNoiseLine(line) {
  if (!line || typeof line !== 'string') return true;
  const trimmed = line.trim();
  if (trimmed.length === 0) return true;

  // OCR or Document wrapper banners, e.g.:
  // --- Transcribed from Document / Handwritten Notes (CN_Unit1_Part2_Notes.pdf) ---
  // === Extracted text from file.pdf ===
  if (/^[-=~*#\s]*(?:transcribed|extracted|document|handwritten|uploaded|photo|scan|ocr|page\s+\d+)[^\n]*[-=~*#\s]*$/i.test(trimmed)) {
    return true;
  }

  // Pure dashes, equals, or asterisks lines (e.g. ---, ===, * * *)
  if (/^[-\s=~*]{3,}[^\n]*[-\s=~*]{3,}$/.test(trimmed) || /^[-\s=~*#]{3,}$/.test(trimmed)) {
    return true;
  }

  // System disclaimer banners / setup advice
  if (/\b(?:gemini|api key|live ai is required|document received|camera capture received)\b/i.test(trimmed)) {
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
  if (isBannerOrNoiseLine(rawTitle)) return fallback;

  // Strip replacement characters, control codes, emojis, and markdown symbols
  let cleaned = rawTitle
    .replace(REPLACEMENT_CHAR_REGEX, '')
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/^[#\-*=>~`\s\d.)]+/, '')
    .replace(/[#\-*=>~`\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If the line contains metadata labels like "Topic:", "Subject:", "Title:", clean them
  cleaned = cleaned.replace(/^(?:Topic|Subject|Title|Chapter|Unit)\s*[:\-]\s*/i, '').trim();

  // Count valid alphabetic characters
  const alphaCount = (cleaned.match(/[a-zA-Z]/g) || []).length;

  // If the title has fewer than 3 real letters or is mostly non-alphanumeric noise
  if (alphaCount < 3 || (alphaCount / Math.max(1, cleaned.length)) < 0.4) {
    return fallback;
  }

  // Reject banner phrases or generic placeholders that leak through
  if (/\b(?:transcribed|handwritten notes|document|page \d+|organized study notes|study notes|class lecture notes)\b/i.test(cleaned)) {
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

  // Filter out OCR / Document header noise banners so they don't pollute the notes
  const nonBannerLines = lines.filter(l => !isBannerOrNoiseLine(l));
  const effectiveLines = nonBannerLines.length > 0 ? nonBannerLines : lines;

  if (effectiveLines.length === 0) {
    // Input was 100% binary or mojiboke
    return {
      cleanedText: `Topic: ${defaultFallbackTopic}\n\n1. Foundational Architecture: Understand core definitions, state transitions, and boundary constraints.\n2. Key Mechanisms: Step-by-step sequential processing with validation checks at each stage.\n3. Common Exam Traps: Watch out for boundary off-by-one errors and distractor options that invert logical conditions.`,
      wasMojiboke: true,
      title: defaultFallbackTopic
    };
  }

  const candidateTitleLine = effectiveLines.find(l => {
    const trimmed = l.replace(/^[#\-*=>~`\s]+/, '').trim();
    return !isBannerOrNoiseLine(l) && trimmed.length >= 4 && (trimmed.match(/[a-zA-Z]/g) || []).length >= 4;
  }) || effectiveLines[0];

  const title = sanitizeTitle(candidateTitleLine, defaultFallbackTopic);
  const cleanedText = effectiveLines.join('\n');

  return {
    cleanedText,
    wasMojiboke: wasCorrupted,
    title
  };
}

/**
 * Normalizes raw LaTeX math and symbols into clean, human-readable student notes
 */
export function cleanLatexMathFormatting(str) {
  if (!str || typeof str !== 'string') return str || '';
  let res = str;

  // 1. Unpack LaTeX \text{...} wrappers
  res = res.replace(/\\text\{([^}]+)\}/g, '$1');

  // 2. Convert standard LaTeX operators and arrows to clean Unicode
  res = res.replace(/\\to\b|\\rightarrow\b/g, '→');
  res = res.replace(/\\leftarrow\b/g, '←');
  res = res.replace(/\\leftrightarrow\b/g, '↔');
  res = res.replace(/\\Rightarrow\b/g, '⇒');
  res = res.replace(/\\Leftarrow\b/g, '⇐');
  res = res.replace(/\\leq\b/g, '≤');
  res = res.replace(/\\geq\b/g, '≥');
  res = res.replace(/\\neq\b/g, '≠');
  res = res.replace(/\\approx\b/g, '≈');
  res = res.replace(/\\times\b/g, '×');
  res = res.replace(/\\div\b/g, '÷');
  res = res.replace(/\\pm\b/g, '±');
  res = res.replace(/\\in\b/g, '∈');
  res = res.replace(/\\notin\b/g, '∉');
  res = res.replace(/\\subset\b/g, '⊂');
  res = res.replace(/\\subseteq\b/g, '⊆');
  res = res.replace(/\\cup\b/g, '∪');
  res = res.replace(/\\cap\b/g, '∩');
  res = res.replace(/\\forall\b/g, '∀');
  res = res.replace(/\\exists\b/g, '∃');

  // 3. Subscripts like t_1, t_2 -> t₁, t₂
  const subMap = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', 'i': 'ᵢ', 'j': 'ⱼ', 'n': 'ₙ', 'k': 'ₖ', 'x': 'ₓ', 'y': 'ᵧ' };
  res = res.replace(/([a-zA-Z])_([0-9ijnkxy])/g, (m, v, s) => v + (subMap[s] || s));
  res = res.replace(/([a-zA-Z])_\{([0-9ijnkxy])\}/g, (m, v, s) => v + (subMap[s] || s));

  // 4. Strip display math $$ ... $$
  res = res.replace(/\$\$\s*([^$]+?)\s*\$\$/g, (m, inner) => inner.trim());

  // 5. Strip inline math $ ... $
  res = res.replace(/\$([^$\n]+?)\$/g, (m, inner) => inner.trim());

  // 6. Clean unescaped backslashes before letters
  res = res.replace(/\\([a-zA-Z]+)/g, '$1');

  // 7. Normalize double spaces
  res = res.replace(/[ \t]{2,}/g, ' ');

  return res.trim();
}

/**
 * Recursively cleans all string fields in an object/array from raw LaTeX
 */
export function cleanObjectMathFormatting(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    return cleanLatexMathFormatting(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanObjectMathFormatting(item));
  }
  if (typeof data === 'object') {
    const cleanedObj = {};
    for (const [k, v] of Object.entries(data)) {
      cleanedObj[k] = cleanObjectMathFormatting(v);
    }
    return cleanedObj;
  }
  return data;
}

