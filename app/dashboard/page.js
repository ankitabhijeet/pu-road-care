'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardList from '@/components/DashboardList';
import { getAllCaptures, getTotalStorageUsed } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const [captures, setCaptures] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const all = await getAllCaptures();
      setCaptures(all);
      const size = await getTotalStorageUsed();
      setTotalSize(size);
    } catch (err) {
      console.error('Failed to load captures:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleted = (id) => {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
    setTotalSize((prev) => {
      const deleted = captures.find((c) => c.id === id);
      return prev - (deleted?.sizeBytes || 0);
    });
  };

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <main className="flex-1 flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-sm text-white/40 hover:text-white/60 transition-colors"
            id="nav-back"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <button
            onClick={() => router.push('/capture')}
            className="flex items-center gap-1.5 text-sm font-medium text-accent-light"
            id="nav-new-capture"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Capture
          </button>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mt-3">
          <span className="gradient-text">Saved Captures</span>
        </h1>

        {/* Stats bar */}
        {captures.length > 0 && (
          <div className="flex items-center gap-4 mt-3 animate-fade-in">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <svg className="w-3.5 h-3.5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <span className="text-xs text-white/50">{captures.length} capture{captures.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <svg className="w-3.5 h-3.5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" />
              </svg>
              <span className="text-xs text-white/50">{formatSize(totalSize)} used</span>
            </div>
          </div>
        )}
      </div>

      {/* Captures list */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 text-accent-light animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
            </svg>
          </div>
        ) : (
          <DashboardList captures={captures} onDeleted={handleDeleted} />
        )}
      </div>
    </main>
  );
}
