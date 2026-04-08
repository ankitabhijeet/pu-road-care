/* eslint-disable react-hooks/set-state-in-effect */
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

      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl', { xrCompatible: true });
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
    startWebXR();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (xrSessionRef.current) {
        xrSessionRef.current.end().catch(console.error);
      }
    };
  }, [startCamera, startWebXR]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" width={1} height={1} />
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
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
    </>
  );
});

export default CameraView;
