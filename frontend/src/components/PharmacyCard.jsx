import React, { useState } from "react";

const STATUS_META = {
  confirmed: {
    label: "Confirmed",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    step: 1,
  },
  dispatched: {
    label: "Out for delivery",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    step: 2,
  },
  delivered: {
    label: "Delivered",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    step: 3,
  },
};

export default function PharmacyCard({
  pharmacy,
  orders = [],
  medications = [],
  onReorder,
}) {
  const [busy, setBusy] = useState(false);
  if (!pharmacy) return null;

  const activeOrder = orders.find((o) => o.status !== "delivered");
  const lastDelivered = orders.find((o) => o.status === "delivered");

  const lowMeds = medications.filter(
    (m) => m.pillsLeft / m.totalPills <= 0.35
  );

  async function refillAllLow() {
    setBusy(true);
    try {
      for (const m of lowMeds) {
        // eslint-disable-next-line no-await-in-loop
        await onReorder(m.id);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pharmacy
          </div>
          <h3 className="text-lg font-bold text-slate-900">Partner pharmacy</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Rating
          </div>
          <div className="text-sm font-bold text-slate-900">
            ★ {pharmacy.rating}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br ${pharmacy.color} flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white`}
        >
          {pharmacy.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {pharmacy.name}
            </h4>
            {pharmacy.verified && (
              <span
                title="Verified partner pharmacy"
                className="text-cyan-600"
                aria-hidden
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M10 1.5l2.39 1.74 2.95-.04.91 2.81 2.39 1.73-1.05 2.76 1.05 2.76-2.39 1.73-.91 2.81-2.95-.04L10 18.5l-2.39-1.74-2.95.04-.91-2.81L1.36 12.26 2.41 9.5 1.36 6.74l2.39-1.73.91-2.81 2.95.04L10 1.5zm-1.1 11.6l5.3-5.3-1.27-1.27-4.03 4.03-1.93-1.93L5.7 9.9l3.2 3.2z" />
                </svg>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {pharmacy.location}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <Pill icon="👤" label={pharmacy.pharmacistName} />
        <Pill icon="🚚" label={`${pharmacy.deliveryEtaHours}h delivery`} />
      </div>

      {activeOrder ? (
        <ActiveOrder order={activeOrder} />
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-900">
            {lowMeds.length > 0
              ? `${lowMeds.length} medicine${lowMeds.length === 1 ? "" : "s"} running low`
              : "All medicines in stock"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {lastDelivered
              ? `Last refill: ${lastDelivered.medicationName} · delivered ${formatRelative(
                  lastDelivered.deliveredAt || lastDelivered.createdAt
                )}`
              : "No previous orders yet."}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={refillAllLow}
              disabled={busy || lowMeds.length === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-3 py-2 text-xs font-semibold shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:hover:opacity-40 disabled:cursor-not-allowed transition"
            >
              {busy
                ? "Sending requests…"
                : lowMeds.length > 0
                  ? `Order all (${lowMeds.length})`
                  : "Nothing to reorder"}
            </button>
            <a
              href={`tel:${pharmacy.phone.replace(/\s+/g, "")}`}
              className="rounded-xl bg-white ring-1 ring-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Call
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function Pill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2 truncate">
      <span aria-hidden>{icon}</span>
      <span className="truncate text-slate-700">{label}</span>
    </div>
  );
}

function ActiveOrder({ order }) {
  const meta = STATUS_META[order.status] || STATUS_META.confirmed;
  const steps = ["confirmed", "dispatched", "delivered"];
  return (
    <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-900 truncate">
          {order.medicationName} · {order.quantity} pills
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${meta.cls}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {steps.map((s, i) => {
          const reached = STATUS_META[s].step <= meta.step;
          return (
            <React.Fragment key={s}>
              <div
                className={[
                  "h-2 flex-1 rounded-full transition-all",
                  reached
                    ? "bg-gradient-to-r from-indigo-500 to-emerald-500"
                    : "bg-slate-200",
                ].join(" ")}
              />
              {i < steps.length - 1 && <span className="w-1" />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Confirmed</span>
        <span>Dispatched</span>
        <span>Delivered</span>
      </div>

      <div className="mt-3 text-[11px] text-slate-600">
        {order.status === "delivered"
          ? "✅ Delivered. Stock updated."
          : `ETA ${new Date(order.eta).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}`}
      </div>
    </div>
  );
}

function formatRelative(ts) {
  if (!ts) return "—";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
