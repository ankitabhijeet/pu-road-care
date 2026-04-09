'use client';

/**
 * SensorManager — manages continuous sensor listeners and provides
 * instant snapshots at photo capture time.
 */

import { CAMERA_HEIGHT_METERS } from '@/lib/constants';

let latestGeo = null;
let latestOrientation = null;
let latestMotion = null;
let latestXRMatrix = null;
let geoWatchId = null;
let geoError = null;
let isListening = false;

/**
 * Push the latest WebXR pose matrix from the rendering loop
 * @param {Float32Array|null} matrix 
 */
export function setLatestXRMatrix(matrix) {
  latestXRMatrix = matrix ? Array.from(matrix) : null;
}

function handleOrientation(e) {
  latestOrientation = {
    alpha: e.alpha,
    beta: e.beta,
    gamma: e.gamma,
    absolute: e.absolute,
  };
}

function handleMotion(e) {
  latestMotion = {
    acceleration: e.acceleration
      ? {
          x: e.acceleration.x,
          y: e.acceleration.y,
          z: e.acceleration.z,
        }
      : null,
    accelerationIncludingGravity: e.accelerationIncludingGravity
      ? {
          x: e.accelerationIncludingGravity.x,
          y: e.accelerationIncludingGravity.y,
          z: e.accelerationIncludingGravity.z,
        }
      : null,
    rotationRate: e.rotationRate
      ? {
          alpha: e.rotationRate.alpha,
          beta: e.rotationRate.beta,
          gamma: e.rotationRate.gamma,
        }
      : null,
    interval: e.interval,
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
        geoError = null;
      },
      (err) => {
        geoError = {
          code: err.code,
          message: err.message,
        };
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

  // DeviceMotion
  window.addEventListener('devicemotion', handleMotion, true);
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
  window.removeEventListener('devicemotion', handleMotion, true);
}

/**
 * Get an instant snapshot of all sensor data at call time.
 * @returns {object} Sensor snapshot
 */
export function snapshotSensors() {
  return {
    timestamp: Date.now(),
    isoTime: new Date().toISOString(),
    geo: latestGeo ? { ...latestGeo } : null,
    geoError: geoError ? { ...geoError } : null,
    camera_height_meters: CAMERA_HEIGHT_METERS,
    camera_pose_matrix: latestXRMatrix ? [...latestXRMatrix] : null,
    orientation: latestOrientation ? { ...latestOrientation } : null,
    motion: latestMotion
      ? {
          acceleration: latestMotion.acceleration
            ? { ...latestMotion.acceleration }
            : null,
          accelerationIncludingGravity:
            latestMotion.accelerationIncludingGravity
              ? { ...latestMotion.accelerationIncludingGravity }
              : null,
          rotationRate: latestMotion.rotationRate
            ? { ...latestMotion.rotationRate }
            : null,
          interval: latestMotion.interval,
        }
      : null,
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
