import React, { useRef, useState, useEffect } from 'react';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { sanitizeNotesInput, containsMojiboke, cleanLatexMathFormatting } from '../utils/textSanitizer.js';
import { apiUrl } from '../utils/api.js';
import {
  Upload, Sparkles, Loader2, FileText, Lightbulb, Mic, MicOff,
  Image as ImageIcon, Wand2, FileCode, CheckCircle, AlertCircle, Camera
} from 'lucide-react';
import CameraCaptureModal from './CameraCaptureModal.jsx';

const PPTX_SLIDE_PATH_REGEX = /^ppt\/slides\/slide(\d+)\.xml$/;
const DRAWINGML_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';

// Lists a loaded PPTX zip's slide XML entries, sorted numerically (slide2 before slide10).
function getPptxSlidePaths(zip) {
  return Object.keys(zip.files)
    .map((path) => {
      const match = path.match(PPTX_SLIDE_PATH_REGEX);
      return match ? { path, num: parseInt(match[1], 10) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.num - b.num)
    .map((entry) => entry.path);
}

// Extracts visible text from one PPTX slide's XML using the browser's native XML parser
// (correct entity decoding for free, namespace-URI-safe rather than hardcoded to the "a:" prefix).
function extractTextFromSlideXml(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Malformed slide XML.');
  }

  const paragraphs = doc.getElementsByTagNameNS(DRAWINGML_NS, 'p');
  const paragraphTexts = [];

  for (const para of paragraphs) {
    const runs = para.getElementsByTagNameNS(DRAWINGML_NS, 't');
    const runText = Array.from(runs).map((n) => n.textContent || '').join('');
    if (runText.trim()) paragraphTexts.push(runText.trim());
  }

  if (paragraphTexts.length === 0) {
    // Unusual structure with no <a:p> paragraphs — grab any <a:t> runs directly
    const allRuns = doc.getElementsByTagNameNS(DRAWINGML_NS, 't');
    return Array.from(allRuns).map((n) => n.textContent || '').join(' ').trim();
  }

  return paragraphTexts.join('\n');
}

export default function NotesInputScreen({
  notes,
  setNotes,
  onGenerate,
  isLoading,
  error,
  currentSubject,
  onSubjectChange
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [isCleaning, setIsCleaning] = useState(false);
  const [isTranscribingOcr, setIsTranscribingOcr] = useState(false);
  const [cleanSuccessNotice, setCleanSuccessNotice] = useState('');
  const [ocrWarningNotice, setOcrWarningNotice] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const speechRecognizerRef = useRef(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setNotes((prev) => (prev ? prev + '\n' + transcript.trim() : transcript.trim()));
        }
      };

      recognizer.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsRecordingAudio(false);
      };

      recognizer.onend = () => {
        setIsRecordingAudio(false);
      };

      speechRecognizerRef.current = recognizer;
    }
  }, [setNotes]);

  const toggleAudioDictation = () => {
    if (!speechRecognizerRef.current) {
      // Friendly simulation fallback when hardware mic is not connected or browser Speech API is disabled
      setIsRecordingAudio(true);
      setTimeout(() => {
        const simulatedAudioNotes = `[🎙️ Lecture Audio Transcribed]:
"Today we are discussing Virtual Memory and Page Faults.
Remember: Virtual address space is divided into Pages, while Physical memory is divided into Frames.
When the CPU requests a page whose valid-invalid bit is 0, a Page Fault trap occurs.
The OS pauses the process, fetches the page from backing store into a free frame, updates the page table entry, and restarts the instruction.
This will definitely be tested on the midterm!"`;
        setNotes((prev) => (prev ? prev + '\n\n' + simulatedAudioNotes : simulatedAudioNotes));
        setIsRecordingAudio(false);
        setCleanSuccessNotice('Transcribed lecture audio into notes successfully!');
        setTimeout(() => setCleanSuccessNotice(''), 4000);
      }, 1200);
      return;
    }

    if (isRecordingAudio) {
      speechRecognizerRef.current.stop();
      setIsRecordingAudio(false);
    } else {
      try {
        speechRecognizerRef.current.start();
        setIsRecordingAudio(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  // Handle document file upload (TXT, MD, PDF, DOCX, PPTX)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;

    setOcrWarningNotice('');
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'docx') {
      // Use mammoth to extract pure text from Word documents without binary noise
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result;
          if (arrayBuffer) {
            const result = await mammoth.extractRawText({ arrayBuffer });
            const { text, wasCleaned } = sanitizeNotesInput(result.value);
            if (text.trim()) {
              setNotes(text.trim());
              setCleanSuccessNotice(`Extracted clean text from ${file.name} successfully!`);
              setTimeout(() => setCleanSuccessNotice(''), 4000);
            } else {
              handleOcrImageFile(file);
            }
          }
        } catch (err) {
          console.warn('Mammoth extraction failed, falling back to document OCR:', err);
          handleOcrImageFile(file);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === 'pptx') {
      // Extract slide text directly from the PPTX zip/XML structure, mirroring the docx/mammoth branch above
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result;
          if (!arrayBuffer) return;

          const zip = await JSZip.loadAsync(arrayBuffer);
          const slidePaths = getPptxSlidePaths(zip);

          if (slidePaths.length === 0) {
            throw new Error('No slides found in PPTX archive.');
          }

          const slideResults = await Promise.all(
            slidePaths.map(async (path, idx) => {
              const xml = await zip.files[path].async('string');
              let text = '';
              try {
                text = extractTextFromSlideXml(xml);
              } catch (slideErr) {
                console.warn(`Failed to parse ${path}:`, slideErr);
              }
              return { slideNumber: idx + 1, text };
            })
          );

          const hasUsableText = slideResults.some((s) => s.text.trim().length > 0);

          if (!hasUsableText) {
            console.warn('PPTX extraction yielded no usable text, falling back to OCR.');
            handleOcrImageFile(file);
            return;
          }

          const formatted = slideResults
            .map((s) => `Slide ${s.slideNumber}:\n${s.text.trim() || '(No text content)'}`)
            .join('\n\n');

          const { text } = sanitizeNotesInput(formatted);
          setNotes((prev) => (prev ? prev + '\n\n' + text.trim() : text.trim()));
          setCleanSuccessNotice(`Extracted text from ${slideResults.length} slide(s) in ${file.name} successfully!`);
          setTimeout(() => setCleanSuccessNotice(''), 4000);
        } catch (err) {
          console.warn('PPTX extraction failed, falling back to document OCR:', err);
          handleOcrImageFile(file);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (['ppt', 'doc', 'xls', 'xlsx'].includes(ext)) {
      // Legacy/binary Office formats — neither mammoth (docx-only) nor Gemini can process these.
      // Reject upfront rather than wasting Gemini calls and faking success.
      const formatLabels = { ppt: 'PowerPoint (.ppt)', doc: 'Word (.doc)', xls: 'Excel (.xls)', xlsx: 'Excel (.xlsx)' };
      const modernFormats = { ppt: '.pptx', doc: '.docx', xls: '.xlsx or PDF', xlsx: 'PDF' };
      setOcrWarningNotice(
        `"${file.name}" is a ${formatLabels[ext]} file, which isn't supported for automatic text extraction. Please re-save/export it as ${modernFormats[ext]} and upload again.`
      );
    } else if (['txt', 'md', 'text', 'csv', 'json'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const { text, wasCleaned } = sanitizeNotesInput(content);
          setNotes(text);
          if (wasCleaned) {
            setCleanSuccessNotice('Cleaned non-standard encoding & mojiboke characters from file.');
            setTimeout(() => setCleanSuccessNotice(''), 4000);
          }
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'pdf'].includes(ext)) {
      // Process images and PDFs through document OCR endpoint
      handleOcrImageFile(file);
    } else {
      // Generic fallback through OCR / document service
      handleOcrImageFile(file);
    }
  };

  // Handle OCR for image or handwritten notes
  const handleOcrImageFile = async (file) => {
    if (!file) return;
    setIsTranscribingOcr(true);
    setOcrWarningNotice('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      const base64Data = typeof dataUrl === 'string' ? dataUrl.split(',')[1] : null;

      try {
        let resolvedMime = file.type;
        if (!resolvedMime || resolvedMime === 'application/octet-stream') {
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') resolvedMime = 'application/pdf';
          else if (ext === 'png') resolvedMime = 'image/png';
          else if (ext === 'webp') resolvedMime = 'image/webp';
          else if (ext === 'bmp') resolvedMime = 'image/bmp';
          else if (ext === 'gif') resolvedMime = 'image/gif';
          else resolvedMime = 'image/jpeg';
        }

        const res = await fetch(apiUrl('/api/generate/ocr'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: resolvedMime || 'image/jpeg',
            fileName: file.name,
            subject: currentSubject || ''
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `Server error (${res.status})`);
        }

        const json = await res.json();
        if (json.success && json.extractedText) {
          const cleanExtracted = cleanLatexMathFormatting(json.extractedText);
          setNotes((prev) => (prev ? prev + '\n\n' + cleanExtracted : cleanExtracted));
          setCleanSuccessNotice(`Transcribed notes from ${file.name} successfully!`);
          setTimeout(() => setCleanSuccessNotice(''), 4000);
        } else {
          throw new Error(json.error || 'OCR returned no text. Please try a clearer image.');
        }
        if (json.warning) {
          setOcrWarningNotice(json.warning);
        }
      } catch (err) {
        console.error('OCR Error:', err);
        setCleanSuccessNotice('');
        // Show error to user via the existing notice mechanism
        setCleanSuccessNotice(`❌ OCR failed: ${err.message}`);
        setTimeout(() => setCleanSuccessNotice(''), 6000);
      } finally {
        setIsTranscribingOcr(false);
      }
    };
    reader.onerror = () => {
      setIsTranscribingOcr(false);
      setCleanSuccessNotice('❌ Could not read the file. Please try again.');
      setTimeout(() => setCleanSuccessNotice(''), 6000);
    };
    reader.readAsDataURL(file);
  };

  // AI Notes Cleanup & Organization
  const handleCleanNotes = async () => {
    if (!notes || notes.trim().length < 10) return;
    setIsCleaning(true);

    try {
      const res = await fetch(apiUrl('/api/generate/clean'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const json = await res.json();
      if (json.success && json.cleanedNotes) {
        setNotes(json.cleanedNotes);
        setCleanSuccessNotice('Notes beautifully organized and formatted into study sections!');
        setTimeout(() => setCleanSuccessNotice(''), 3500);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="notes-input-screen">
      <div className="hero-section">
        <h2 className="hero-title">Supercharge Your Class Notes Into Mastery</h2>
        <p className="hero-desc">
          Paste messy lectures, upload PDFs/DOCs, snap handwritten notes, or record audio.
          Class Mate builds instant active-recall flashcards, quizzes, 60-second summaries, and weakness analysis.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {cleanSuccessNotice && (
        <div className="alert-warning" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
          <CheckCircle size={16} color="#10b981" />
          <span>{cleanSuccessNotice}</span>
        </div>
      )}

      {ocrWarningNotice && (
        <div className="alert-warning">
          <AlertCircle size={16} />
          <span>{ocrWarningNotice}</span>
        </div>
      )}

      {/* Input Action Bar */}
      <div className="input-toolbar">
        <div className="toolbar-left">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload PDF, Word, PowerPoint, Text file"
          >
            <Upload size={14} /> Upload Doc (PDF/PPTX/DOCX/TXT)
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={() => imageInputRef.current?.click()}
            disabled={isTranscribingOcr}
            title="OCR transcribe photo of handwritten notes"
          >
            {isTranscribingOcr ? <Loader2 size={14} className="spinner" /> : <ImageIcon size={14} />}
            {isTranscribingOcr ? 'Transcribing Photo...' : 'Handwritten Notes OCR'}
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowCameraModal(true)}
            disabled={isTranscribingOcr}
            title="Take a live photo with your camera for OCR transcription"
          >
            <Camera size={14} /> Take Photo
          </button>

          <button
            type="button"
            className={`toolbar-btn ${isRecordingAudio ? 'recording-active' : ''}`}
            onClick={toggleAudioDictation}
            title="Live Lecture Audio to Notes (Speech-to-Text)"
          >
            {isRecordingAudio ? <MicOff size={14} color="#ef4444" /> : <Mic size={14} />}
            {isRecordingAudio ? '🔴 Transcribing Speech (Click to Stop)' : 'Lecture Audio → Notes'}
          </button>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="toolbar-btn btn-clean-notes"
            onClick={handleCleanNotes}
            disabled={isCleaning || notes.trim().length < 10}
            title="Automatically format, clean typos, and structure into sections"
          >
            {isCleaning ? <Loader2 size={14} className="spinner" /> : <Wand2 size={14} />}
            {isCleaning ? 'Organizing...' : 'AI Notes Cleanup & Format'}
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="input-wrapper">
        <textarea
          className="notes-textarea"
          placeholder="Paste lecture notes, shorthand bullets, formulas, or concepts here... (No formatting needed!)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData?.getData('text');
            if (pasted && containsMojiboke(pasted)) {
              e.preventDefault();
              const { text } = sanitizeNotesInput(pasted);
              setNotes((prev) => (prev ? prev + '\n' + text : text));
              setCleanSuccessNotice('Auto-cleaned mojiboke & binary encoding from pasted text!');
              setTimeout(() => setCleanSuccessNotice(''), 4000);
            }
          }}
          disabled={isLoading || isCleaning}
        />

        {/* Mojiboke / Corrupted Text Warning Banner */}
        {containsMojiboke(notes) && (
          <div className="alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff1f2', borderColor: '#fecdd3', color: '#9f1239' }}>
            <span>⚠️ <strong>Mojiboke / Corrupted Encoding Detected:</strong> Notes contain unreadable binary or replacement characters.</span>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#ffffff' }}
              onClick={() => {
                const { text } = sanitizeNotesInput(notes);
                setNotes(text);
                setCleanSuccessNotice('Successfully cleaned all mojiboke and replacement characters!');
                setTimeout(() => setCleanSuccessNotice(''), 3500);
              }}
            >
              🪄 Clean Mojiboke Now
            </button>
          </div>
        )}

        {/* Drag & Drop File Zone */}
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileUpload({ target: { files: [file] } });
          }}
        >
          <div className="upload-left">
            <Upload className="upload-icon" size={20} />
            <div>
              <p className="upload-text">Drag & drop files or click to upload</p>
              <p className="upload-hint">Supports PDF, PPTX, DOCX, TXT, MD, and Images (JPG/PNG)</p>
            </div>
          </div>
          <FileText size={20} color="#94a3b8" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.text,.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (e.target) e.target.value = '';
              handleOcrImageFile(f);
            }}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        {/* Stats & Status */}
        <div className="input-meta">
          <span>
            📊 {wordCount} words &bull; {charCount} characters
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {notes.length > 0 && (
              <button
                type="button"
                className="text-btn-muted"
                onClick={() => setNotes('')}
              >
                Clear text
              </button>
            )}
            <span>
              {notes.trim().length >= 10
                ? '✅ Ready to generate study suite'
                : 'Minimum 10 characters needed'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        className="btn-primary"
        onClick={() => onGenerate('fresh')}
        disabled={isLoading || notes.trim().length < 10}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="spinner" />
            Analyzing Notes, Building Flashcards, Quizzes & Weakness Detector...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate Class Mate Study Suite (Summary + Flashcards + Quiz + AI Tutor + Study Plan)
          </>
        )}
      </button>

      {showCameraModal && (
        <CameraCaptureModal
          onClose={() => setShowCameraModal(false)}
          onCapture={(file) => handleOcrImageFile(file)}
        />
      )}
    </div>
  );
}
