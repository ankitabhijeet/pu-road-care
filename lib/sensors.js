'use client';

/**
 * SensorManager — manages continuous sensor listeners and provides
 * instant snapshots at photo capture time.
 */

import { CAMERA_HEIGHT_METERS } from '@/lib/constants';

let latestGeo = null;
let latestOrientation = null;
let geoWatchId = null;
let isListening = false;

function handleOrientation(e) {
  latestOrientation = {
    alpha: e.alpha,
    beta: e.beta,
    gamma: e.gamma,
    absolute: e.absolute,
  };
}

/**
 * Start all sensor listeners
 */
export function startSensors() {
  if (isListening) return;
  isListening = true;

  // Geolocation — continuous watch
  if ('geolocation' in navigator) {
    geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        latestGeo = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  }

  // DeviceOrientation
  window.addEventListener('deviceorientation', handleOrientation, true);
}

/**
 * Stop all sensor listeners
 */
export function stopSensors() {
  if (!isListening) return;
  isListening = false;

  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }

  window.removeEventListener('deviceorientation', handleOrientation, true);
}

/**
 * Get an instant snapshot of all sensor data at call time.
 * @returns {object} Sensor snapshot
 */
export function snapshotSensors() {
  return {
    timestamp: Date.now(),
    geo: latestGeo ? {
      latitude: latestGeo.latitude,
      longitude: latestGeo.longitude,
      accuracy: latestGeo.accuracy,
    } : null,
    camera_height_meters: CAMERA_HEIGHT_METERS,
    orientation: latestOrientation ? {
      alpha: latestOrientation.alpha,
      beta: latestOrientation.beta,
      gamma: latestOrientation.gamma,
    } : null,
  };
}

/**
 * Get current GPS accuracy for UI display
 * @returns {number|null} accuracy in meters
 */
export function getGpsAccuracy() {
  return latestGeo?.accuracy ?? null;
}

/**
 * Check if any GPS data has been received
 * @returns {boolean}
 */
export function hasGpsLock() {
  return latestGeo !== null;
}
