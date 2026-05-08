import React from "react";

function PillIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pillGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="3"
        fill="url(#pillGrad)"
      />
      <rect x="3" y="6" width="9" height="12" rx="3" fill="#ffffff" fillOpacity="0.18" />
      <circle cx="7.5" cy="12" r="1.1" fill="#ffffff" />
      <circle cx="11" cy="12" r="1.1" fill="#ffffff" fillOpacity="0.7" />
    </svg>
  );
}

export default function Header({ connected }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 blur-md opacity-40" />
          <div className="relative h-12 w-12 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center">
            <PillIcon className="h-7 w-7" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight text-slate-900">
            SmartDabba
          </div>
          <div className="text-xs text-slate-500 -mt-0.5">
            Caring from afar, one pill at a time
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={[
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
            connected
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-600 ring-slate-200",
          ].join(" ")}
        >
          <span
            className={[
              "h-2 w-2 rounded-full",
              connected ? "bg-emerald-500 animate-pulseSoft" : "bg-slate-400",
            ].join(" ")}
          />
          {connected ? "Device online" : "Reconnecting…"}
        </div>
      </div>
    </header>
  );
}
