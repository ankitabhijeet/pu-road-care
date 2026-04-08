'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';
import { requestCamera, requestGeolocation, requestIMU } from '@/lib/permissions';

const PERMISSION_CARDS = [
  {
    key: 'camera',
    title: 'Camera',
    description: 'Capture high-resolution photos of road damage',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    key: 'geolocation',
    title: 'Location',
    description: 'Tag each capture with precise GPS coordinates',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    key: 'imu',
    title: 'Motion Sensors',
    description: 'Record device orientation & acceleration for 3D reconstruction',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
];

export default function PermissionsGate() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({
    camera: 'pending',
    geolocation: 'pending',
    imu: 'pending',
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState(null);

  const handleGrantAll = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    const denied = [];

    // ⚠️ IMU MUST be requested FIRST — iOS Safari requires DeviceOrientationEvent.requestPermission()
    // to be called in the DIRECT call stack of a user gesture (tap). After any async dialog
    // (camera/geo), iOS considers the gesture expired and silently denies IMU access.
    setPermissions((p) => ({ ...p, imu: 'loading' }));
    const imuResult = await requestIMU();
    const imuOk = imuResult === 'granted' || imuResult === 'not_required';
    setPermissions((p) => ({ ...p, imu: imuOk ? 'granted' : 'denied' }));
    if (!imuOk) denied.push('Motion Sensors');

    // Camera
    setPermissions((p) => ({ ...p, camera: 'loading' }));
    const camResult = await requestCamera();
    const camOk = camResult === 'granted';
    setPermissions((p) => ({ ...p, camera: camOk ? 'granted' : 'denied' }));
    if (!camOk) denied.push('Camera');

    // Geolocation
    setPermissions((p) => ({ ...p, geolocation: 'loading' }));
    const geoResult = await requestGeolocation();
    const geoOk = geoResult === 'granted';
    setPermissions((p) => ({ ...p, geolocation: geoOk ? 'granted' : 'denied' }));
    if (!geoOk) denied.push('Location');

    if (denied.length === 0) {
      // Brief delay so user sees all green, then navigate
      setTimeout(() => {
        router.push('/capture');
      }, 600);
    } else {
      setError(
        `Permission denied for: ${denied.join(', ')}. Please enable in your browser settings and tap the button again.`
      );
    }

    setIsRequesting(false);
  }, [router]);

  const allGranted = Object.values(permissions).every(
    (v) => v === 'granted' || v === 'not_required'
  );

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto stagger-children">
      {/* Permission Cards */}
      {PERMISSION_CARDS.map((card) => (
        <div
          key={card.key}
          className="w-full glass rounded-2xl p-5 mb-3 flex items-center gap-4 transition-all duration-300"
        >
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              permissions[card.key] === 'granted'
                ? 'bg-success/15 text-success'
                : permissions[card.key] === 'denied'
                ? 'bg-danger/15 text-danger'
                : 'bg-white/5 text-white/40'
            }`}
          >
            {card.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              <StatusBadge status={permissions[card.key]} />
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{card.description}</p>
          </div>
        </div>
      ))}

      {/* Error Message */}
      {error && (
        <div className="w-full bg-danger/10 border border-danger/20 rounded-2xl p-4 mb-4 animate-scale-in">
          <p className="text-sm text-danger/90 leading-relaxed">{error}</p>
          <p className="text-xs text-white/30 mt-2 leading-relaxed">
            On iOS: Settings → Safari → Camera/Location/Motion & Orientation Access
          </p>
        </div>
      )}

      {/* Grant Button */}
      <button
        onClick={handleGrantAll}
        disabled={isRequesting || allGranted}
        className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
        id="grant-permissions-btn"
      >
        {isRequesting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
            </svg>
            Requesting Access...
          </>
        ) : allGranted ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            All Permissions Granted
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Grant All Permissions
          </>
        )}
      </button>

      {/* Skip to Dashboard */}
      {allGranted && (
        <button
          onClick={() => router.push('/capture')}
          className="btn-secondary w-full mt-3 animate-scale-in"
        >
          Start Capture →
        </button>
      )}
    </div>
  );
}
