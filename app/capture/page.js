'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CameraView from '@/components/CameraView';
import CaptureGuide from '@/components/CaptureGuide';
import { capturePhoto } from '@/lib/capture';
import { startSensors, stopSensors, hasGpsLock, getGpsAccuracy } from '@/lib/sensors';
import { CAPTURE_STEPS } from '@/lib/constants';
import { saveTempCapture, clearTempCaptures } from '@/lib/storage';

export default function CapturePage() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('searching');
  const [cameraReady, setCameraReady] = useState(false);

  // Start sensors and clear temp on mount
  useEffect(() => {
    startSensors();
    clearTempCaptures();

    // GPS status polling
    const gpsInterval = setInterval(() => {
      if (hasGpsLock()) {
        const accuracy = getGpsAccuracy();
        setGpsStatus(accuracy < 10 ? 'strong' : accuracy < 30 ? 'moderate' : 'weak');
      } else {
        setGpsStatus('searching');
      }
    }, 1000);

    return () => {
      stopSensors();
      clearInterval(gpsInterval);
    };
  }, []);

  const handleCapture = useCallback(async () => {
    if (isCapturing || !cameraReady) return;
    setIsCapturing(true);

    try {
      const videoEl = cameraRef.current?.getVideoElement();
      if (!videoEl) throw new Error('Camera not ready');

      // Flash effect
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);

      const result = await capturePhoto(videoEl);
      
      // Save to IndexedDB immediately for reliability
      await saveTempCapture(currentStep, result.blob, result.sensors, result.thumbnail);

      const newCaptures = [...captures, result];
      setCaptures(newCaptures);

      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // All 4 captures done — stop camera and go to review
        cameraRef.current?.stopCamera();
        stopSensors();

        // Store metadata in sessionStorage for quick UI reference
        const capturesForStorage = newCaptures.map((c, i) => ({
          thumbnail: c.thumbnail,
          sensors: c.sensors,
          blobSize: c.blob.size,
          stepId: i
        }));
        sessionStorage.setItem('reviewCaptures', JSON.stringify(capturesForStorage));

        router.push('/review');
      }
    } catch (err) {
      console.error('Capture failed:', err);
      alert('Failed to capture photo. Please try again.');
    }

    setIsCapturing(false);
  }, [isCapturing, cameraReady, captures, currentStep, router]);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  const handleCameraError = useCallback((err) => {
    console.error('Camera error:', err);
    alert('Camera access failed. Please grant camera permission and try again.');
    router.push('/');
  }, [router]);

  const gpsConfig = {
    searching: { color: 'text-warning', bg: 'bg-warning/15', label: 'GPS...', pulse: true },
    weak: { color: 'text-warning', bg: 'bg-warning/15', label: '±30m+', pulse: false },
    moderate: { color: 'text-accent-light', bg: 'bg-accent/15', label: '±10-30m', pulse: false },
    strong: { color: 'text-success', bg: 'bg-success/15', label: '±<10m', pulse: false },
  };

  const gps = gpsConfig[gpsStatus];

  return (
    <div id="ar-ui-overlay" className="absolute inset-0 overflow-hidden bg-transparent">
      <div className="viewfinder">
        {/* Camera */}
      <CameraView
        ref={cameraRef}
        onReady={handleCameraReady}
        onError={handleCameraError}
      />

      {/* Guide overlays */}
      <CaptureGuide currentStep={currentStep} captures={captures} />

      {/* GPS indicator */}
      <div className={`absolute top-28 left-3 z-20 glass rounded-xl px-3 py-1.5 flex items-center gap-2 ${gps.pulse ? 'gps-searching' : ''}`}>
        <div className={`w-2 h-2 rounded-full ${gps.bg} ${gps.color}`}>
          <div className={`w-2 h-2 rounded-full ${gpsStatus === 'strong' ? 'bg-success' : gpsStatus === 'moderate' ? 'bg-accent-light' : 'bg-warning'}`} />
        </div>
        <span className={`text-[11px] font-medium ${gps.color}`}>{gps.label}</span>
      </div>

      {/* Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 z-30 bg-white capture-flash pointer-events-none" />
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 safe-bottom">
        <div className="flex items-center justify-center pb-8 pt-6">
          {/* Cancel button */}
          <button
            onClick={() => {
              cameraRef.current?.stopCamera();
              stopSensors();
              router.push('/');
            }}
            className="absolute left-6 bottom-10 text-sm text-white/50 font-medium"
            id="cancel-capture-btn"
          >
            Cancel
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={isCapturing || !cameraReady}
            className="relative group"
            id="capture-photo-btn"
          >
            {/* Outer ring */}
            <div className="w-[76px] h-[76px] rounded-full border-[3px] border-white/80 flex items-center justify-center transition-all duration-150 group-active:scale-95">
              {/* Inner circle */}
              <div
                className={`w-[62px] h-[62px] rounded-full transition-all duration-150 ${
                  isCapturing
                    ? 'bg-white/60 scale-90'
                    : 'bg-white group-active:bg-white/80 group-active:scale-95'
                }`}
              />
            </div>
            {/* Pulse ring (animated) */}
            {cameraReady && !isCapturing && (
              <div
                className="absolute inset-0 rounded-full border-2 border-white/20"
                style={{ animation: 'pulse-ring 2s ease-in-out infinite' }}
              />
            )}
          </button>

          {/* Step info */}
          <div className="absolute right-6 bottom-10 text-right">
            <p className="text-sm font-bold text-white/80">{currentStep + 1}/4</p>
            <p className="text-[10px] text-white/40">{CAPTURE_STEPS[currentStep]?.shortLabel}</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
