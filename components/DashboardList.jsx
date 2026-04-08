'use client';

import { useState } from 'react';
import { downloadBlob, deleteCapture } from '@/lib/storage';

export default function DashboardList({ captures, onDeleted }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  async function handleDownload(capture) {
    setDownloadingId(capture.id);
    try {
      downloadBlob(capture.blob, capture.name);
    } catch (err) {
      console.error('Download failed:', err);
    }
    setTimeout(() => setDownloadingId(null), 1000);
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteCapture(id);
      onDeleted?.(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  if (captures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white/60 mb-2">No captures yet</h3>
        <p className="text-sm text-white/30 text-center max-w-xs">
          Start your first pothole survey to see saved data packages here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      {captures.map((capture) => (
        <div
          key={capture.id}
          className="glass rounded-2xl p-4 transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white truncate pr-2">
                {capture.name}
              </h3>
              <p className="text-xs text-white/40 mt-1">
                {formatDate(capture.createdAt)}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs font-mono text-white/30 bg-white/5 rounded-lg px-2 py-1">
              {formatSize(capture.sizeBytes)}
            </span>
          </div>

          {/* GPS summary */}
          {capture.summary?.latitude && (
            <div className="flex items-center gap-2 mb-3 bg-white/3 rounded-xl px-3 py-2">
              <svg className="w-3.5 h-3.5 text-accent-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-[11px] text-white/50 font-mono truncate">
                {capture.summary.latitude.toFixed(5)}, {capture.summary.longitude.toFixed(5)}
                {capture.summary.accuracy && (
                  <span className="text-white/30"> · ±{capture.summary.accuracy.toFixed(0)}m</span>
                )}
              </p>
            </div>
          )}

          {/* Photos count */}
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="text-xs text-white/40">
              {capture.captureCount} photos + metadata
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(capture)}
              disabled={downloadingId === capture.id}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
              id={`download-btn-${capture.id}`}
            >
              {downloadingId === capture.id ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download to Phone
                </>
              )}
            </button>

            {confirmDeleteId === capture.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(capture.id)}
                  disabled={deletingId === capture.id}
                  className="btn-danger py-3 px-4 text-sm"
                >
                  {deletingId === capture.id ? '...' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn-secondary py-3 px-4 text-sm"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(capture.id)}
                className="btn-secondary py-3 px-4 text-sm flex items-center"
                id={`delete-btn-${capture.id}`}
              >
                <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
