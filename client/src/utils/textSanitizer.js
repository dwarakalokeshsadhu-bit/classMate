/**
 * Client-Side Text Sanitizer & Anti-Mojiboke Utility
 * Detects and strips Unicode replacement characters (\uFFFD),
 * unprintable control bytes, and binary artifacts from uploaded/pasted files.
 */

const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const REPLACEMENT_CHAR_REGEX = /\uFFFD/g;

/**
 * Detects if a string contains mojiboke or raw binary data
 */
export function containsMojiboke(str) {
  if (!str || typeof str !== 'string') return false;
  if (REPLACEMENT_CHAR_REGEX.test(str)) return true;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(str)) return true;

  // If text has significant length but suspiciously low letter ratio
  const letters = (str.match(/[a-zA-Z]/g) || []).length;
  if (str.length > 20 && (letters / str.length) < 0.3) {
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

  if (/^[-=~*#\s]*(?:transcribed|extracted|document|handwritten|uploaded|photo|scan|ocr|page\s+\d+)[^\n]*[-=~*#\s]*$/i.test(trimmed)) {
    return true;
  }

  if (/^[-\s=~*]{3,}[^\n]*[-\s=~*]{3,}$/.test(trimmed) || /^[-\s=~*#]{3,}$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Sanitizes text, stripping replacement characters and removing binary line fragments
 */
export function sanitizeNotesInput(raw) {
  if (!raw || typeof raw !== 'string') return { text: '', wasCleaned: false };

  const hadMojiboke = containsMojiboke(raw);

  // Strip replacement characters and non-printable control characters
  let cleaned = raw
    .replace(REPLACEMENT_CHAR_REGEX, '')
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(/\r\n/g, '\n');

  // Filter out any lines that are predominantly binary symbols
  const lines = cleaned.split('\n').filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const alphaCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    // Keep lines that have at least 2 alphanumeric chars and are not purely garbage symbols
    return alphaCount >= 2 && (alphaCount / trimmed.length) >= 0.25;
  });

  // Filter out OCR / Document noise banners
  const nonBannerLines = lines.filter(l => !isBannerOrNoiseLine(l));
  const effectiveLines = nonBannerLines.length > 0 ? nonBannerLines : lines;

  const finalText = effectiveLines.join('\n');
  const normalizedText = cleanLatexMathFormatting(finalText || (hadMojiboke ? "Cleaned lecture notes ready for revision tools generation." : raw));

  return {
    text: normalizedText,
    wasCleaned: hadMojiboke
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

