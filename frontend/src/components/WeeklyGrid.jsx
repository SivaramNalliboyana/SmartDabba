import React from "react";

const STYLE = {
  taken: {
    cell: "bg-emerald-500 text-white ring-emerald-600",
    icon: "✓",
    label: "All doses",
  },
  partial: {
    cell: "bg-amber-400 text-white ring-amber-500",
    icon: "◐",
    label: "Partial",
  },
  missed: {
    cell: "bg-rose-500 text-white ring-rose-600",
    icon: "✕",
    label: "Missed",
  },
  pending: {
    cell: "bg-white text-slate-600 ring-indigo-300 ring-2",
    icon: "•",
    label: "Today",
  },
  future: {
    cell: "bg-slate-100 text-slate-400 ring-slate-200",
    icon: "·",
    label: "Upcoming",
  },
};

export default function WeeklyGrid({ week = [] }) {
  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            This week
          </div>
          <h3 className="text-lg font-bold text-slate-900">Weekly overview</h3>
        </div>
        <Legend />
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 sm:gap-3">
        {week.map((day) => {
          const s = STYLE[day.status] || STYLE.future;
          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">
                {day.label}
              </span>
              <div
                title={`${day.date} — ${s.label}${day.total > 0 ? ` (${day.taken}/${day.total})` : ""}`}
                className={[
                  "h-12 w-full sm:h-14 rounded-2xl ring-1 flex flex-col items-center justify-center transition",
                  s.cell,
                ].join(" ")}
              >
                <span className="text-base font-bold leading-none">
                  {day.dayNum}
                </span>
                <span className="text-[10px] opacity-90 leading-none mt-0.5">
                  {s.icon}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Legend() {
  const items = [
    { cls: "bg-emerald-500", label: "All taken" },
    { cls: "bg-amber-400", label: "Partial" },
    { cls: "bg-rose-500", label: "Missed" },
  ];
  return (
    <div className="hidden sm:flex items-center gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${i.cls}`} />
          <span className="text-xs text-slate-500">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
