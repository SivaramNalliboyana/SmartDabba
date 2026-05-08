import React, { useState } from "react";

function stockLevel(med) {
  const pct = (med.pillsLeft / med.totalPills) * 100;
  const perDay = med.times?.length || 1;
  const days = perDay > 0 ? Math.floor(med.pillsLeft / perDay) : null;
  let tone;
  if (pct <= 15) tone = "critical";
  else if (pct <= 35) tone = "low";
  else tone = "ok";
  return { pct, days, tone, perDay };
}

const TONE = {
  critical: {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    bar: "bg-rose-500",
    label: "Critical",
  },
  low: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
    label: "Low",
  },
  ok: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
    label: "In stock",
  },
};

export default function MedicineInventory({
  medications = [],
  orders = [],
  onReorder,
}) {
  const [pending, setPending] = useState({});

  function activeOrderFor(medId) {
    return orders.find(
      (o) => o.medicationId === medId && o.status !== "delivered"
    );
  }

  async function handleReorder(med) {
    setPending((p) => ({ ...p, [med.id]: true }));
    try {
      await onReorder(med.id);
    } finally {
      setPending((p) => ({ ...p, [med.id]: false }));
    }
  }

  const lowCount = medications.filter(
    (m) => stockLevel(m).tone !== "ok"
  ).length;

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Inventory
          </div>
          <h3 className="text-lg font-bold text-slate-900">Medicine stock</h3>
        </div>
        {lowCount > 0 ? (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
            {lowCount} need{lowCount === 1 ? "s" : ""} refill
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            All stocked
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {medications.map((m) => {
          const s = stockLevel(m);
          const tone = TONE[s.tone];
          const active = activeOrderFor(m.id);
          const isPending = pending[m.id];

          return (
            <li
              key={m.id}
              className="rounded-2xl ring-1 ring-slate-200 p-3.5 hover:ring-slate-300 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white shadow-sm`}
                >
                  <PillGlyph />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {m.name}
                    </span>
                    <span className="text-xs text-slate-500">{m.dosage}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {(m.times || []).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400">
                      · {s.perDay}× / day
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${tone.badge}`}
                >
                  {tone.label}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${tone.bar} transition-all`}
                      style={{ width: `${Math.max(4, s.pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      <span className="font-semibold text-slate-700">
                        {m.pillsLeft}
                      </span>{" "}
                      / {m.totalPills} pills
                    </span>
                    {s.days != null && (
                      <span>
                        ~{s.days} day{s.days === 1 ? "" : "s"} left
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                {active ? (
                  <OrderChip order={active} />
                ) : s.tone === "ok" ? (
                  <button
                    onClick={() => handleReorder(m)}
                    disabled={isPending}
                    className="w-full rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-50 transition"
                  >
                    Order refill from pharmacy
                  </button>
                ) : (
                  <button
                    onClick={() => handleReorder(m)}
                    disabled={isPending}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-60 transition"
                  >
                    {isPending ? "Sending request…" : "Reorder now from pharmacist"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
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
      <rect x="3" y="9" width="9" height="6" rx="3" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

function OrderChip({ order }) {
  const map = {
    confirmed: {
      label: "Order confirmed",
      cls: "bg-indigo-50 text-indigo-700 ring-indigo-200",
      dot: "bg-indigo-500",
    },
    dispatched: {
      label: "Out for delivery",
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      dot: "bg-amber-500",
    },
    delivered: {
      label: "Delivered",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dot: "bg-emerald-500",
    },
  };
  const m = map[order.status] || map.confirmed;
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ring-1 ${m.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot} animate-pulseSoft`} />
      <span>{m.label}</span>
      <span className="ml-auto opacity-70">
        {order.quantity} pills · ETA{" "}
        {new Date(order.eta).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
