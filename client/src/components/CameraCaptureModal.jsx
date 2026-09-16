import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';

// Maps getUserMedia failure modes to a friendly, non-technical message.
function describeCameraError(err) {
  const name = err?.name;
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera permission was denied. Please allow camera access in your browser\'s site settings and try again.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera was found on this device. Try uploading a photo instead.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'The camera is currently in use by another application. Close it and try again.';
  }
  return 'Unable to access the camera right now. Please try again or upload a photo instead.';
}

export default function CameraCaptureModal({ onCapture, onClose }) {
  const [mode, setMode] = useState('live'); // 'live' | 'preview' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const capturedBlobRef = useRef(null);
  const isMountedRef = useRef(true);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        'Camera access isn\'t available in this browser or requires a secure (HTTPS) connection. You can still upload a photo using the buttons above instead.'
      );
      setMode('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (!isMountedRef.current) return;
      setErrorMessage(describeCameraError(err));
      setMode('error');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    startCamera();

    return () => {
      isMountedRef.current = false;
      stopStream();
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return prev;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !isStreamReady || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Camera capture failed: canvas produced no image data.');
          return;
        }
        capturedBlobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
        setMode('preview');
      },
      'image/jpeg',
      0.85
    );
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    capturedBlobRef.current = null;
    setMode('live');
  };

  const handleConfirm = () => {
    if (!capturedBlobRef.current) return;
    const file = new File([capturedBlobRef.current], `camera-capture-${Date.now()}.jpg`, {
      type: 'image/jpeg'
    });
    onCapture(file);
    stopStream();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  };

  const handleCloseClick = () => {
    stopStream();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  };

  return (
    <div className="camera-capture-backdrop" onClick={handleCloseClick}>
      <div className="camera-capture-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-capture-header">
          <div className="camera-capture-header-title">
            <div className="camera-capture-icon-badge">
              <Camera size={18} color="#96A78D" />
            </div>
            <div>
              <h3>Take a Photo</h3>
              <p>Capture handwritten notes for instant OCR transcription</p>
            </div>
          </div>
          <button
            type="button"
            className="camera-capture-close-btn"
            onClick={handleCloseClick}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {mode === 'error' && (
          <div className="camera-capture-error-box">
            <AlertCircle size={28} />
            <p>{errorMessage}</p>
            <button type="button" className="camera-capture-btn-retake" onClick={handleCloseClick}>
              Close
            </button>
          </div>
        )}

        {mode !== 'error' && (
          <div className="camera-capture-video-wrap">
            {mode === 'live' && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => setIsStreamReady(true)}
                  className="camera-capture-video"
                />
                {!isStreamReady && (
                  <div className="camera-capture-loading-overlay">
                    <Loader2 size={22} className="spinner" />
                    <span>Starting camera…</span>
                  </div>
                )}
              </>
            )}
            {mode === 'preview' && (
              <img src={previewUrl} alt="Captured notes preview" className="camera-capture-preview-img" />
            )}
          </div>
        )}

        {mode === 'live' && (
          <div className="camera-capture-controls">
            <button
              type="button"
              className="camera-capture-shutter-btn"
              onClick={handleCapture}
              disabled={!isStreamReady}
              title="Capture photo"
            />
            <p className="camera-capture-hint-text">Position your handwritten notes within the frame</p>
          </div>
        )}

        {mode === 'preview' && (
          <div className="camera-capture-controls camera-capture-controls-row">
            <button type="button" className="camera-capture-btn-retake" onClick={handleRetake}>
              <RotateCcw size={15} /> Retake
            </button>
            <button type="button" className="camera-capture-btn-confirm" onClick={handleConfirm}>
              <Check size={15} /> Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
