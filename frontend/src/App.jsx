import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import StatusPanel from "./components/StatusPanel.jsx";
import ActivityFeed from "./components/ActivityFeed.jsx";
import WeeklyGrid from "./components/WeeklyGrid.jsx";
import FamilyPanel from "./components/FamilyPanel.jsx";
import MedicineInventory from "./components/MedicineInventory.jsx";
import PharmacyCard from "./components/PharmacyCard.jsx";
import { useDabbaSocket } from "./useDabbaSocket.js";

function Toast({ event }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [event]);

  if (!event || !visible) return null;
  const opened = event.type === "opened";
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
      <div
        className={[
          "flex items-center gap-3 rounded-full px-4 py-2.5 shadow-lg ring-1",
          opened
            ? "bg-emerald-600 text-white ring-emerald-700"
            : "bg-slate-900 text-white ring-slate-800",
        ].join(" ")}
      >
        <span className="text-base" aria-hidden>
          {opened ? "📤" : "📥"}
        </span>
        <span className="text-sm font-medium">
          {opened ? "Box opened — alert sent" : "Box closed"}
        </span>
        <span className="text-xs opacity-80">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const { state, connected, lastEvent, reorder } = useDabbaSocket();

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <Header connected={connected} />

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <StatusPanel state={state} />
            <WeeklyGrid week={state?.week ?? []} />
            <PharmacyCard
              pharmacy={state?.pharmacy}
              orders={state?.orders ?? []}
              medications={state?.medications ?? []}
              onReorder={reorder}
            />
            <MedicineInventory
              medications={state?.medications ?? []}
              orders={state?.orders ?? []}
              onReorder={reorder}
            />
          </div>

          <div className="space-y-5">
            <ActivityFeed events={state?.events ?? []} />
            <FamilyPanel family={state?.family ?? []} />
          </div>
        </main>

        <footer className="mt-10 text-center text-xs text-slate-400">
          SmartDabba · ESP32 + hall sensor · Real-time WebSocket dashboard
        </footer>
      </div>

      <Toast event={lastEvent} />
    </div>
  );
}
