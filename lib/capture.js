'use client';

import { JPEG_QUALITY } from './constants';
import { snapshotSensors } from './sensors';

/**
 * Capture a photo from a video element and snapshot all sensor data.
 * @param {HTMLVideoElement} videoEl - The live camera video element
 * @returns {Promise<{blob: Blob, sensors: object, thumbnail: string}>}
 */
export async function capturePhoto(videoEl) {
  if (!videoEl || videoEl.readyState < 2) {
    throw new Error('Video stream not ready');
  }

  // Get the actual video resolution
  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;

  // Create offscreen canvas at full video resolution
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, width, height);

  // Snapshot sensors at the exact moment of capture
  const sensors = snapshotSensors();

  // Generate high-quality JPEG blob
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob'));
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });

  // Generate a small thumbnail for the UI
  const thumbCanvas = document.createElement('canvas');
  const thumbSize = 200;
  const aspect = width / height;
  thumbCanvas.width = aspect >= 1 ? thumbSize : thumbSize * aspect;
  thumbCanvas.height = aspect >= 1 ? thumbSize / aspect : thumbSize;
  const thumbCtx = thumbCanvas.getContext('2d');
  thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.6);

  return { blob, sensors, thumbnail };
}
