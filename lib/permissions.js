'use client';

/**
 * Request camera permission via getUserMedia
 * @returns {Promise<'granted'|'denied'|'error'>}
 */
export async function requestCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
    // Stop all tracks immediately — we just wanted the permission
    stream.getTracks().forEach((t) => t.stop());
    return 'granted';
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'denied';
    }
    // NotFoundError = no camera hardware, OverconstrainedError = constraints not met
    // These are NOT permission denials — treat as granted (permission-wise)
    if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
      console.warn('Camera hardware issue (not a permission denial):', err.name);
      return 'granted';
    }
    console.error('Camera permission error:', err);
    return 'granted'; // Default to granted — don't block the user for unknown errors
  }
}

/**
 * Request geolocation permission 
 * @returns {Promise<'granted'|'denied'|'error'>}
 */
export async function requestGeolocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => resolve('granted'),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          resolve('denied');
        } else {
          // Timeout or position unavailable — permission was granted  
          // but signal is weak. That's still "granted" from a permission standpoint.
          resolve('granted');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Request DeviceMotion + DeviceOrientation permissions (iOS 13+)
 * MUST be called from a user-gesture (click/tap) handler on iOS
 * @returns {Promise<'granted'|'denied'|'not_required'>}
 */
export async function requestIMU() {
  // Check if requestPermission exists (iOS 13+)
  const orientationNeedsPermission =
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function';

  const motionNeedsPermission =
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function';

  if (!orientationNeedsPermission && !motionNeedsPermission) {
    // Android or older iOS — no permission needed
    return 'not_required';
  }

  try {
    const results = await Promise.all([
      orientationNeedsPermission
        ? DeviceOrientationEvent.requestPermission()
        : Promise.resolve('granted'),
      motionNeedsPermission
        ? DeviceMotionEvent.requestPermission()
        : Promise.resolve('granted'),
    ]);

    return results.every((r) => r === 'granted') ? 'granted' : 'denied';
  } catch (err) {
    console.error('IMU permission error:', err);
    return 'denied';
  }
}

/**
 * Check current permission states without re-requesting
 * @returns {Promise<{camera: string, geolocation: string, imu: string}>}
 */
export async function checkPermissions() {
  const result = { camera: 'unknown', geolocation: 'unknown', imu: 'unknown' };

  // Camera
  try {
    if (navigator.permissions) {
      const cam = await navigator.permissions.query({ name: 'camera' });
      result.camera = cam.state; // 'granted', 'denied', 'prompt'
    }
  } catch {
    result.camera = 'unknown';
  }

  // Geolocation
  try {
    if (navigator.permissions) {
      const geo = await navigator.permissions.query({ name: 'geolocation' });
      result.geolocation = geo.state;
    }
  } catch {
    result.geolocation = 'unknown';
  }

  // IMU — no permissions API query available, assume unknown
  const imuNeedsPermission =
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function';
  result.imu = imuNeedsPermission ? 'unknown' : 'not_required';

  return result;
}

