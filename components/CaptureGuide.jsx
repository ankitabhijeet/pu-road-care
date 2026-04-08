'use client';

import { CAPTURE_STEPS } from '@/lib/constants';

export default function CaptureGuide({ currentStep, captures }) {
  const step = CAPTURE_STEPS[currentStep];
  if (!step) return null;

  return (
    <>
      {/* Top bar — step indicator */}
      <div className="absolute top-0 left-0 right-0 z-20 safe-top">
        <div className="glass-strong px-5 pt-3 pb-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {CAPTURE_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    i < currentStep
                      ? 'bg-success/20 text-success border border-success/30'
                      : i === currentStep
                      ? 'gradient-accent text-white shadow-lg shadow-accent/30'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}
                >
                  {i < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.shortLabel
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`w-6 h-0.5 rounded transition-all duration-500 ${
                      i < currentStep ? 'bg-success/40' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step label */}
          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              Step {currentStep + 1} of 4
            </p>
            <p className="text-lg font-bold gradient-text mt-0.5">
              {step.label}
            </p>
          </div>
        </div>
      </div>

      {/* Direction indicator overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        {/* Direction arrow */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            step.direction === 'left' ? 'left-5' : 'right-5'
          }`}
        >
          <div
            className={`text-5xl ${
              step.direction === 'left' ? 'arrow-left' : 'arrow-right'
            }`}
          >
            {step.direction === 'left' ? '◀' : '▶'}
          </div>
        </div>

        {/* Distance hint */}
        <div className="absolute bottom-44 left-0 right-0 flex justify-center">
          <div className="glass rounded-2xl px-5 py-3 max-w-xs">
            <p className="text-sm text-white/80 text-center leading-relaxed">
              {step.instruction}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail strip of previous captures */}
      {captures.length > 0 && (
        <div className="absolute top-32 right-3 z-20 flex flex-col gap-2">
          {captures.map((cap, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-xl overflow-hidden border-2 border-success/40 shadow-lg animate-scale-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cap.thumbnail}
                alt={CAPTURE_STEPS[i].label}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
