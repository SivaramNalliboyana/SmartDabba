import React from "react";

function statusText(member) {
  const seen = (member.lastSeen || "").toLowerCase();
  if (seen.includes("online")) return { label: "ONLINE", online: true };
  return { label: `LAST SEEN ${member.lastSeen.toUpperCase()}`, online: false };
}

export default function FamilyPanel({ family = [] }) {
  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notifications
          </div>
          <h3 className="text-lg font-bold text-slate-900">Family circle</h3>
        </div>
        <span className="text-xs text-slate-500">
          {family.length} {family.length === 1 ? "member" : "members"}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {family.map((m) => {
          const s = statusText(m);
          return (
            <li key={m.id}>
              <button className="w-full flex items-center gap-3 rounded-2xl px-2 py-2.5 -mx-2 hover:bg-slate-50 active:bg-slate-100 transition text-left">
                <div className="relative shrink-0">
                  <div
                    className={`h-11 w-11 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white`}
                  >
                    {m.avatar}
                  </div>
                  <span
                    className={[
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white",
                      s.online ? "bg-emerald-500" : "bg-slate-300",
                    ].join(" ")}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {m.name.split(" ")[0]}{" "}
                    <span className="text-slate-500 font-medium">
                      ({m.relation})
                    </span>
                  </div>
                  <div
                    className={[
                      "mt-0.5 text-[10px] font-bold tracking-wider",
                      s.online ? "text-emerald-600" : "text-slate-400",
                    ].join(" ")}
                  >
                    {s.label}
                  </div>
                </div>

                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="7 4 13 10 7 16" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <button className="mt-4 w-full rounded-2xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition">
        + INVITE MEMBER
      </button>
    </section>
  );
}
