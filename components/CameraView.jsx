/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

const CameraView = forwardRef(function CameraView({ onReady, onError }, ref) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [focusIndicator, setFocusIndicator] = useState(null);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    stopCamera: () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    },
  }));

  const startCamera = useCallback(async () => {
    try {
      // Request the rear camera at high quality
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Critical: ensure these attributes are set before play()
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.muted = true;

        try {
          await videoRef.current.play();
        } catch (playErr) {
          // Some browsers need a user gesture; will still work on tap
          console.warn('Autoplay blocked, stream ready for manual play:', playErr);
        }

        setIsReady(true);
        onReady?.();
      }
    } catch (err) {
      console.error('Camera start error:', err);
      onError?.(err);
    }
  }, [onReady, onError]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // Tap-to-focus: safe implementation that does NOT call applyConstraints
  // unless the hardware explicitly supports pointsOfInterest.
  // This avoids iOS WebKit video stalls entirely.
  const handleTapToFocus = useCallback(async (e) => {
    if (!videoRef.current || !streamRef.current) return;

    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Show visual focus ring at tap location
    setFocusIndicator({ x, y });
    setTimeout(() => setFocusIndicator(null), 1200);

    // Try hardware focus ONLY on devices that explicitly support pointsOfInterest
    const track = streamRef.current.getVideoTracks()[0];
    if (!track || typeof track.getCapabilities !== 'function') return;

    const capabilities = track.getCapabilities();
    const supportsPOI = Array.isArray(capabilities.pointsOfInterest);

    if (supportsPOI) {
      try {
        await track.applyConstraints({
          advanced: [{
            pointsOfInterest: [{ x: x / rect.width, y: y / rect.height }],
          }],
        });
      } catch (err) {
        console.warn('pointsOfInterest focus failed:', err);
      }
    }
    // On iOS/unsupported: show ring for UX feedback only — no hardware call
  }, []);

  return (
    <>
      {/* Live camera feed — fills parent absolutely */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        onClick={handleTapToFocus}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />

        {/* Focus ring indicator */}
        {focusIndicator && (
          <div
            className="absolute pointer-events-none border-2 border-white w-14 h-14 rounded-lg"
            style={{
              left: focusIndicator.x,
              top: focusIndicator.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
            }}
          />
        )}
      </div>

      {/* Loading overlay — shown until stream is live */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-accent-light animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
            </svg>
            <p className="text-sm text-white/50">Starting camera...</p>
          </div>
        </div>
      )}
    </>
  );
});

export default CameraView;
