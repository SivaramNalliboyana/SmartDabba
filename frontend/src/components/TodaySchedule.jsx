import React, { useEffect, useState } from "react";

const STATUS_META = {
  taken: {
    label: "Taken",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rowCls: "ring-emerald-100",
  },
  pending: {
    label: "Due now",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    rowCls: "ring-amber-300 bg-amber-50/40",
  },
  upcoming: {
    label: "Upcoming",
    cls: "bg-slate-50 text-slate-600 ring-slate-200",
    rowCls: "ring-slate-200",
  },
  missed: {
    label: "Missed",
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    rowCls: "ring-rose-200",
  },
};

function fmtTime(t) {
  const [hh, mm] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtTimeFromMs(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeUntil(target, now) {
  const diff = target - now;
  if (diff <= 0) return "now";
  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

export default function TodaySchedule({ schedule = [] }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const taken = schedule.filter((d) => d.status === "taken").length;
  const total = schedule.length;

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Today
          </div>
          <h3 className="text-lg font-bold text-slate-900">Dose schedule</h3>
        </div>
        <span className="text-xs text-slate-500">
          {taken} / {total} taken
        </span>
      </div>

      {schedule.length === 0 ? (
        <div className="mt-4 text-center text-sm text-slate-500 py-6">
          No doses scheduled today.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {schedule.map((d) => {
            const meta = STATUS_META[d.status] || STATUS_META.upcoming;
            return (
              <li
                key={d.id}
                className={[
                  "flex items-center gap-3 rounded-2xl ring-1 p-3 transition",
                  meta.rowCls,
                ].join(" ")}
              >
                <div className="text-right shrink-0 w-14">
                  <div className="text-sm font-bold text-slate-900">
                    {fmtTime(d.time)}
                  </div>
                </div>
                <div
                  className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center text-white shadow-sm`}
                >
                  <PillGlyph />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {d.medicationName}{" "}
                    <span className="text-slate-500 font-medium">
                      · {d.dosage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {d.status === "taken" && d.takenAt
                      ? `Taken at ${fmtTimeFromMs(d.takenAt)}`
                      : d.status === "upcoming"
                        ? `${timeUntil(d.scheduledTime, now)}`
                        : d.status === "pending"
                          ? "Reminder due — open the box"
                          : d.status === "missed"
                            ? "No box opening detected"
                            : ""}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${meta.cls}`}
                >
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PillGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect
        x="3"
        y="9"
        width="18"
        height="6"
        rx="3"
        fill="white"
        fillOpacity="0.95"
      />
      <rect
        x="3"
        y="9"
        width="9"
        height="6"
        rx="3"
        fill="white"
        fillOpacity="0.6"
      />
    </svg>
  );
}
