/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { checkWebXRSupport } from '@/lib/permissions';
import { setLatestXRMatrix } from '@/lib/sensors';

const CameraView = forwardRef(function CameraView({ onReady, onError }, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const xrSessionRef = useRef(null);
  const rafIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [xrRequested, setXrRequested] = useState(false);
  const [xrActive, setXrActive] = useState(false);
  const [localWebXRSupport, setLocalWebXRSupport] = useState(false);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    stopCamera: () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (xrSessionRef.current) {
        xrSessionRef.current.end().catch(console.error);
        xrSessionRef.current = null;
      }
      setLatestXRMatrix(null);
    },
  }));

  const startWebXR = useCallback(async () => {
    try {
      const supported = await checkWebXRSupport();
      if (!supported) return;

      const overlayElement = document.getElementById('ar-ui-overlay') || document.body;
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local', 'dom-overlay'],
        domOverlay: { root: overlayElement }
      });
      xrSessionRef.current = session;
      setXrActive(true);

      const canvas = canvasRef.current;
      // explicitly enforce alpha:true on the WebGL boundary just in case
      const gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true });
      session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

      const refSpace = await session.requestReferenceSpace('local');

      const onXRFrame = (time, frame) => {
        const pose = frame.getViewerPose(refSpace);
        if (pose) {
          setLatestXRMatrix(pose.transform.matrix);
        }
        rafIdRef.current = session.requestAnimationFrame(onXRFrame);
      };
      rafIdRef.current = session.requestAnimationFrame(onXRFrame);

      session.addEventListener('end', () => {
        xrSessionRef.current = null;
        setXrActive(false);
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        setLatestXRMatrix(null);
      });
    } catch (err) {
      console.warn('WebXR AR failed to start:', err);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
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
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('autoplay', '');
        await videoRef.current.play();

        // Attempt to enable continuous focus if supported
        const track = stream.getVideoTracks()[0];
        if (track && 'applyConstraints' in track) {
          const capabilities = track.getCapabilities?.() || {};
          const constraints = {};

          if (capabilities.focusMode?.includes('continuous')) {
            constraints.focusMode = 'continuous';
          }
          if (capabilities.whiteBalanceMode?.includes('continuous')) {
            constraints.whiteBalanceMode = 'continuous';
          }

          if (Object.keys(constraints).length > 0) {
            track.applyConstraints({ advanced: [constraints] }).catch(err => {
              console.warn('Failed to apply advanced camera constraints:', err);
            });
          }
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
    checkWebXRSupport().then(setLocalWebXRSupport);
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (xrSessionRef.current) {
        xrSessionRef.current.end().catch(console.error);
      }
    };
  }, [startCamera]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" width={1} height={1} />
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${xrActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        playsInline
        autoPlay
        muted
      />
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

      {/* WebXR Optional Gesture Overlay */}
      {isReady && localWebXRSupport && !xrRequested && (
        <div 
          className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          onClick={() => {
            setXrRequested(true);
            startWebXR();
          }}
        >
          <div className="bg-white/10 p-6 rounded-3xl border border-white/20 glass max-w-sm">
            <svg className="w-12 h-12 text-accent-light mx-auto mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Try AR Tracking Mode</h3>
            <p className="text-sm text-white/70 mb-4">
              Your browser supports WebXR! Tap here to try capturing the 3D Tracking Matrix alongside your photos.
            </p>
            <div className="bg-warning/10 text-warning text-xs p-3 rounded-lg text-left">
              <strong>Warning:</strong> On some iOS browsers, activating this feature may turn the camera black. If that happens, simply reload the app and skip this step. The app will automatically fall back to the mathematically precise Camera Height measurement!
            </div>
          </div>
        </div>
      )}

      {/* Skip button for the AR overlay so they aren't trapped if they want normal capture but their phone registers WebXR logic! */}
      {isReady && localWebXRSupport && !xrRequested && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering AR
            setXrRequested(true); // just hide the overlay
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 text-white/60 text-sm underline px-4 py-2"
        >
          Skip AR Tracking
        </button>
      )}
    </>
  );
});

export default CameraView;
