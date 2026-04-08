'use client';

export default function ReviewCard({ capture, step, index }) {
  const geo = capture.sensors?.geo;
  const orientation = capture.sensors?.orientation;

  return (
    <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Image */}
      <div className="relative aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={capture.thumbnail}
          alt={step.label}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="glass rounded-lg px-3 py-1 text-xs font-semibold text-white">
            {step.label}
          </span>
        </div>
      </div>

      {/* Sensor summary */}
      <div className="p-4 space-y-2">
        {/* GPS */}
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-accent-light mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <div className="min-w-0 flex-1">
            {geo ? (
              <>
                <p className="text-xs text-white/70 font-mono truncate">
                  {geo.latitude?.toFixed(6)}, {geo.longitude?.toFixed(6)}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Accuracy: ±{geo.accuracy?.toFixed(1)}m
                  {geo.altitude != null && ` · Alt: ${geo.altitude?.toFixed(1)}m`}
                </p>
              </>
            ) : (
              <p className="text-xs text-warning/70">GPS not available</p>
            )}
          </div>
        </div>

        {/* Orientation */}
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-accent-light mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
          </svg>
          <div className="min-w-0 flex-1">
            {orientation ? (
              <p className="text-xs text-white/70 font-mono">
                α:{orientation.alpha?.toFixed(1)}° β:{orientation.beta?.toFixed(1)}° γ:{orientation.gamma?.toFixed(1)}°
              </p>
            ) : (
              <p className="text-xs text-white/40">Orientation not available</p>
            )}
          </div>
        </div>

        {/* File size */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <p className="text-xs text-white/40">
            {(capture.blob.size / 1024).toFixed(0)} KB
          </p>
        </div>
      </div>
    </div>
  );
}
