'use client';

import { useRouter } from 'next/navigation';
import PermissionsGate from '@/components/PermissionsGate';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col px-5 py-6 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div />
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          id="nav-dashboard"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Saved
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-8 mt-6 animate-fade-in">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl gradient-accent flex items-center justify-center shadow-2xl shadow-accent/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          {/* Glow */}
          <div className="absolute -inset-4 gradient-accent opacity-15 blur-2xl rounded-full" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <span className="gradient-text">PU Road Care</span>
        </h1>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed">
          Offline pothole data collection for 3D reconstruction & analysis
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <span className="text-xs text-white/25 font-medium uppercase tracking-wider">Permissions</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>

      {/* Permissions */}
      <PermissionsGate />

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-[11px] text-white/15">
          PU Road Care v1.0 · All data stored locally on device
        </p>
      </div>
    </main>
  );
}
