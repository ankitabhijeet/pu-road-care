'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReviewCard from '@/components/ReviewCard';
import { packageCaptures } from '@/lib/packager';
import { saveCapture } from '@/lib/storage';
import { CAPTURE_STEPS } from '@/lib/constants';

export default function ReviewPage() {
  const router = useRouter();
  const [captures, setCaptures] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Retrieve captures from the global variable set by capture page
    const data = window.__puRoadCareCaptures;
    if (data && data.length === 4) {
      setCaptures(data);
    } else {
      // Try to recover from sessionStorage for display
      try {
        const stored = sessionStorage.getItem('reviewCaptures');
        if (stored) {
          const parsed = JSON.parse(stored);
          // We only have thumbnails and sensors, not blobs — display-only mode
          setCaptures(parsed.map((p) => ({ ...p, blob: new Blob([]) })));
        } else {
          router.push('/capture');
        }
      } catch {
        router.push('/capture');
      }
    }
  }, [router]);

  const handleSave = async () => {
    if (isSaving || !captures || !window.__puRoadCareCaptures) return;
    setIsSaving(true);

    try {
      const realCaptures = window.__puRoadCareCaptures;
      const { blob, name, metadata } = await packageCaptures(realCaptures);
      await saveCapture(name, blob, metadata);

      // Clean up
      delete window.__puRoadCareCaptures;
      sessionStorage.removeItem('reviewCaptures');

      setSaved(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save capture package. Please try again.');
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    delete window.__puRoadCareCaptures;
    sessionStorage.removeItem('reviewCaptures');
    router.push('/capture');
  };

  if (!captures) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-accent-light animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
          </svg>
          <p className="text-sm text-white/50">Loading captures...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Review Captures</span>
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Verify all 4 photos and sensor data before saving
        </p>
      </div>

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {captures.map((capture, i) => (
            <ReviewCard
              key={i}
              capture={capture}
              step={CAPTURE_STEPS[i]}
              index={i}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-4 mt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-sm font-semibold text-white mb-3">Package Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Photos</span>
              <span className="text-white/70">{captures.length} images (JPEG)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Sensor data</span>
              <span className="text-white/70">GPS + IMU per image</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Output format</span>
              <span className="text-white/70">.zip (4 .jpg + metadata.json)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Total size (est.)</span>
              <span className="text-white/70 font-mono">
                {captures.reduce
                  ? `~${(captures.reduce((sum, c) => sum + (c.blob?.size || c.blobSize || 0), 0) / 1024).toFixed(0)} KB`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-5 pt-3 space-y-3">
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="btn-primary w-full flex items-center justify-center gap-2"
          id="save-capture-btn"
        >
          {saved ? (
            <>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved Successfully!
            </>
          ) : isSaving ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
              </svg>
              Packaging & Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Save & Store Locally
            </>
          )}
        </button>

        <button
          onClick={handleRetake}
          disabled={isSaving}
          className="btn-secondary w-full"
          id="retake-btn"
        >
          ← Retake Photos
        </button>
      </div>
    </main>
  );
}
