import React from "react";

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PERIODS = [
  { key: "morning", label: "Morning", range: [5, 11] },
  { key: "noon", label: "Noon", range: [11, 16] },
  { key: "evening", label: "Evening", range: [16, 20] },
  { key: "night", label: "Night", range: [20, 29] },
];

function bucketSchedule(schedule) {
  const buckets = Object.fromEntries(
    PERIODS.map((p) => [p.key, { hasDose: false, allTaken: true }]),
  );
  schedule.forEach((d) => {
    const hour = new Date(d.scheduledTime).getHours();
    const adjusted = hour < 5 ? hour + 24 : hour;
    const period = PERIODS.find(
      (p) => adjusted >= p.range[0] && adjusted < p.range[1],
    );
    if (!period) return;
    buckets[period.key].hasDose = true;
    if (d.status !== "taken") buckets[period.key].allTaken = false;
  });
  return buckets;
}

export default function StatusPanel({ state, onSimulate }) {
  const taken = state?.todayStats?.taken ?? 0;
  const total = state?.todayStats?.total ?? 0;
  const allDone = state?.todayStats?.allDone;
  const nextDose = state?.nextDose;
  const streak = state?.streak ?? 0;
  const lastOpenedAt = state?.lastOpenedAt;
  const buckets = bucketSchedule(state?.todaySchedule ?? []);

  const hasTakenSomething = taken > 0;
  const headline = allDone
    ? "All Doses Complete"
    : hasTakenSomething
      ? "Morning Routine Complete"
      : "Awaiting First Dose";

  const description = allDone
    ? "Your parent has taken every scheduled dose today. No more doses remaining."
    : hasTakenSomething
      ? `Your parent has successfully taken their morning medication. Next dose is at ${nextDose ? formatTime(nextDose.scheduledTime) : "the scheduled time"}.`
      : "The smart dispenser is ready. Awaiting the first dose of the day.";

  return (
    <section className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        <div className="relative shrink-0">
          <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-emerald-50 ring-[6px] ring-emerald-200 flex items-center justify-center">
            <svg
              className="h-14 w-14 text-emerald-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="5 12 10 17 19 8" />
            </svg>
          </div>
          {streak > 0 && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-300 px-3 py-1 text-xs font-semibold text-orange-900 shadow-sm">
              {streak} {streak === 1 ? "day" : "days"} streak 🔥
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="5 12 10 17 19 8" />
            </svg>
            {hasTakenSomething ? "Medicine Taken" : "Awaiting Dose"}
          </span>

          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {headline}
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5">
            {PERIODS.map((p) => {
              const b = buckets[p.key];
              const taken = b.hasDose && b.allTaken;
              const skipped = !b.hasDose;
              return (
                <div
                  key={p.key}
                  className="flex items-center gap-1.5 text-xs"
                  title={
                    skipped
                      ? `No ${p.label.toLowerCase()} dose`
                      : taken
                        ? `${p.label} dose taken`
                        : `${p.label} dose pending`
                  }
                >
                  <span
                    className={[
                      "inline-flex h-4 w-4 items-center justify-center rounded-[4px] ring-1",
                      skipped
                        ? "bg-slate-50 ring-slate-200 text-slate-300"
                        : taken
                          ? "bg-emerald-600 ring-emerald-600 text-white"
                          : "bg-white ring-slate-300 text-transparent",
                    ].join(" ")}
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="5 12 10 17 19 8" />
                    </svg>
                  </span>
                  <span
                    className={[
                      "font-medium",
                      skipped
                        ? "text-slate-300 line-through"
                        : taken
                          ? "text-slate-700"
                          : "text-slate-500",
                    ].join(" ")}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 max-w-md mx-auto sm:mx-0">
            <InfoBox
              label="Last Box Opening"
              value={lastOpenedAt ? formatTime(lastOpenedAt) : "—"}
            />
            <InfoBox
              label="Next Scheduled"
              value={
                allDone
                  ? "Done"
                  : nextDose
                    ? formatTime(nextDose.scheduledTime)
                    : "—"
              }
            />
          </div>

          <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-2">
            <button
              onClick={() => onSimulate("opened")}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 active:scale-[0.98] transition"
            >
              Simulate: lid opened
            </button>
            <button
              onClick={() => onSimulate("closed")}
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 active:scale-[0.98] transition"
            >
              Simulate: lid closed
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-base sm:text-lg font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}
