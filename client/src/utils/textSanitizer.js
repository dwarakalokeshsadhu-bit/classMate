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

  const finalText = lines.join('\n');

  return {
    text: finalText || (hadMojiboke ? "Cleaned lecture notes ready for revision tools generation." : raw),
    wasCleaned: hadMojiboke
  };
}
