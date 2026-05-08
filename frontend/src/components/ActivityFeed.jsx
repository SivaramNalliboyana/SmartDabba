import React from "react";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const DOT_STYLE = {
  opened: "bg-emerald-500 ring-emerald-100",
  closed: "bg-slate-400 ring-slate-100",
  reminder: "bg-amber-500 ring-amber-100",
  sync: "bg-indigo-500 ring-indigo-100",
};

function labelFor(type) {
  switch (type) {
    case "opened":
      return "Box opened";
    case "closed":
      return "Box closed";
    case "reminder":
      return "Daily reminder sent";
    case "sync":
      return "Sync successful";
    default:
      return type;
  }
}

export default function ActivityFeed({ events = [] }) {
  const newestFirst = [...events].reverse();

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Live activity
          </div>
          <h3 className="text-lg font-bold text-slate-900">Box events</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 ring-1 ring-rose-200">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulseSoft" />
          <span className="text-[11px] font-semibold text-rose-700">LIVE</span>
        </div>
      </div>

      <div className="mt-5 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
        {newestFirst.length === 0 ? (
          <div className="px-2 py-10 text-center text-sm text-slate-500">
            No events yet. Waiting for the SmartDabba…
          </div>
        ) : (
          <ol className="relative pl-5">
            <span
              aria-hidden
              className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-slate-200"
            />
            {newestFirst.map((e) => {
              const dot = DOT_STYLE[e.type] || DOT_STYLE.closed;
              return (
                <li
                  key={e.id}
                  className="animate-slideUp relative pb-5 last:pb-0"
                >
                  <span
                    className={[
                      "absolute -left-[18px] top-1 h-3 w-3 rounded-full ring-4",
                      dot,
                    ].join(" ")}
                  />
                  <div className="text-sm font-semibold text-slate-900">
                    {labelFor(e.type)}
                    {e.medication && (
                      <span className="ml-1 font-normal text-slate-500">
                        · {e.medication.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatTime(e.timestamp)}
                    {e.medication && (
                      <span className="ml-1 text-slate-400">
                        (scheduled {e.medication.time})
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
