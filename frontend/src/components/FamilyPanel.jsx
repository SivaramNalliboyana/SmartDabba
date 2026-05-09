import React, { useEffect, useState } from "react";

function relativeFromNow(ts, now) {
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotificationLine({ n, now }) {
  if (!n) return null;
  if (n.status === "sending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-70 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </span>
        Notifying about {n.doseName}…
      </span>
    );
  }
  if (n.status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
        <span aria-hidden>📬</span>
        Notification delivered
      </span>
    );
  }
  if (n.status === "acked") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
        <span className="text-sm leading-none animate-pop" aria-hidden>
          {n.reaction}
        </span>
        Saw {n.doseName} · {relativeFromNow(n.ackedAt, now)}
      </span>
    );
  }
  return null;
}

function MemberRow({ m, now }) {
  const seen = (m.lastSeen || "").toLowerCase();
  const online = seen.includes("online");

  return (
    <li className="rounded-2xl px-2 py-2.5 -mx-2 hover:bg-slate-50 transition">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className={`h-11 w-11 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white`}
          >
            {m.avatar}
          </div>
          <span
            className={[
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white",
              online ? "bg-emerald-500" : "bg-slate-300",
            ].join(" ")}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">
            {m.name.split(" ")[0]}{" "}
            <span className="text-slate-500 font-medium">({m.relation})</span>
          </div>
          <div className="mt-0.5 truncate">
            {m.notification ? (
              <NotificationLine n={m.notification} now={now} />
            ) : (
              <span className="text-[10px] font-bold tracking-wider text-slate-400">
                {online ? "ONLINE" : `LAST SEEN ${m.lastSeen.toUpperCase()}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={`tel:${(m.phone || "").replace(/\s+/g, "")}`}
            title={`Call ${m.name.split(" ")[0]}`}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M2.5 4.5A2 2 0 014.5 2.5h1.4a1 1 0 01.97.76l.7 2.78a1 1 0 01-.27.95l-1.2 1.2a11.5 11.5 0 005.51 5.51l1.2-1.2a1 1 0 01.95-.27l2.78.7a1 1 0 01.76.97v1.4a2 2 0 01-2 2A13 13 0 012.5 4.5z" />
            </svg>
          </a>
          <button
            title={`Message ${m.name.split(" ")[0]}`}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100 transition"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M2.5 5a2 2 0 012-2h11a2 2 0 012 2v8a2 2 0 01-2 2h-7l-3.7 2.96A.75.75 0 013.5 17.5V15a2 2 0 01-1-1.73V5z" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function FamilyPanel({ family = [] }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const liveCount = family.filter(
    (m) => m.notification && m.notification.status !== "acked"
  ).length;
  const ackedRecently = family.filter(
    (m) =>
      m.notification &&
      m.notification.status === "acked" &&
      Date.now() - m.notification.ackedAt < 60_000
  ).length;

  const subtitle =
    liveCount > 0
      ? `Notifying ${liveCount} member${liveCount === 1 ? "" : "s"}…`
      : ackedRecently > 0
        ? `${ackedRecently} acknowledged just now`
        : "Notified on every dose taken or missed";

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notifications
          </div>
          <h3 className="text-lg font-bold text-slate-900">Family circle</h3>
        </div>
        {liveCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 ring-1 ring-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulseSoft" />
            <span className="text-[11px] font-semibold text-indigo-700">LIVE</span>
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            {family.length} {family.length === 1 ? "member" : "members"}
          </span>
        )}
      </div>

      <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>

      <ul className="mt-4 space-y-1.5">
        {family.map((m) => (
          <MemberRow key={m.id} m={m} now={now} />
        ))}
      </ul>

      <button className="mt-4 w-full rounded-2xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition">
        + INVITE MEMBER
      </button>
    </section>
  );
}
