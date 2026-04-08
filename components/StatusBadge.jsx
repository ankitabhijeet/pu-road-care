'use client';

import { useState } from 'react';

export default function StatusBadge({ status, label }) {
  const config = {
    granted: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      statusText: 'Granted',
    },
    denied: {
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      text: 'text-danger',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      statusText: 'Denied',
    },
    pending: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      text: 'text-white/40',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 115.636 5.636a9 9 0 0113.728 0z" />
        </svg>
      ),
      statusText: 'Required',
    },
    loading: {
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      text: 'text-accent-light',
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
        </svg>
      ),
      statusText: 'Requesting...',
    },
    not_required: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      statusText: 'Available',
    },
  };

  const c = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border} transition-all duration-300`}
    >
      {c.icon}
      {c.statusText}
    </span>
  );
}
