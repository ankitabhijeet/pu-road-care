'use client';

import JSZip from 'jszip';
import { CAPTURE_STEPS } from './constants';

/**
 * Package 4 captures into a single .zip file with metadata.json
 * @param {Array<{blob: Blob, sensors: object}>} captures - Array of 4 capture objects
 * @returns {Promise<{blob: Blob, name: string, metadata: object}>}
 */
export async function packageCaptures(captures) {
  if (captures.length !== 4) {
    throw new Error(`Expected 4 captures, got ${captures.length}`);
  }

  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const metadata = {
    version: '1.0',
    app: 'PU Road Care',
    created: new Date().toISOString(),
    timestamp_id: timestamp,
    device: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio,
      },
    },
    captures: [],
  };

  for (let i = 0; i < captures.length; i++) {
    const step = CAPTURE_STEPS[i];
    const capture = captures[i];

    // Add image to zip
    zip.file(step.filename, capture.blob);

    // Add capture metadata
    metadata.captures.push({
      file: step.filename,
      label: step.label,
      direction: step.direction,
      distance: step.distance,
      sensor_data: capture.sensors,
    });
  }

  // Add metadata JSON
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Generate the zip blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const name = `pothole_${timestamp}.zip`;

  return { blob, name, metadata };
}
