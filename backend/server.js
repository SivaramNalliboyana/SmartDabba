import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PENDING_WINDOW_MS = 30 * 60 * 1000;
const MATCH_WINDOW_MS = 90 * 60 * 1000;

const state = {
  boxOpen: false,
  lastOpenedAt: null,
  lastClosedAt: null,
  streak: 0,
  events: [],
  takenDoses: {},
  family: [
    {
      id: "f1",
      name: "Aarav Mehta",
      relation: "Son",
      location: "San Francisco, USA",
      avatar: "AM",
      color: "from-indigo-500 to-purple-500",
      lastSeen: "Online now",
    },
    {
      id: "f2",
      name: "Priya Mehta",
      relation: "Daughter",
      location: "London, UK",
      avatar: "PM",
      color: "from-pink-500 to-rose-500",
      lastSeen: "2m ago",
    },
    {
      id: "f3",
      name: "Dr. Rohan Kapoor",
      relation: "Family Doctor",
      location: "Mumbai, IN",
      avatar: "RK",
      color: "from-emerald-500 to-teal-500",
      lastSeen: "1h ago",
    },
  ],
  medications: [
    {
      id: "m1",
      name: "Metformin",
      dosage: "500 mg",
      schedule: "After breakfast & dinner",
      times: ["08:00", "20:00"],
      pillsLeft: 4,
      totalPills: 60,
      color: "from-amber-400 to-orange-500",
    },
    {
      id: "m2",
      name: "Vitamin D3",
      dosage: "1000 IU",
      schedule: "With breakfast",
      times: ["09:00"],
      pillsLeft: 22,
      totalPills: 30,
      color: "from-emerald-400 to-teal-500",
    },
    {
      id: "m3",
      name: "Atorvastatin",
      dosage: "10 mg",
      schedule: "At bedtime",
      times: ["22:00"],
      pillsLeft: 9,
      totalPills: 30,
      color: "from-rose-400 to-pink-500",
    },
  ],
  pharmacy: {
    id: "p1",
    name: "Apollo Pharmacy",
    pharmacistName: "Dr. Anjali Sharma",
    location: "Bandra West, Mumbai",
    phone: "+91 98765 43210",
    rating: 4.8,
    deliveryEtaHours: 4,
    avatar: "AP",
    color: "from-cyan-500 to-blue-600",
    verified: true,
  },
  orders: [],
};

function dateKey(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function getDosesForDate(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  const result = [];
  for (const med of state.medications) {
    for (const t of med.times) {
      const [hh, mm] = t.split(":").map(Number);
      const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
      result.push({
        id: `${dayKey}::${med.id}::${t}`,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        time: t,
        scheduledTime: dt.getTime(),
        color: med.color,
      });
    }
  }
  result.sort((a, b) => a.scheduledTime - b.scheduledTime);
  return result;
}

function getTodaySchedule() {
  const now = Date.now();
  const doses = getDosesForDate(dateKey(now));
  return doses.map((d) => {
    const takenAt = state.takenDoses[d.id];
    let status;
    if (takenAt) status = "taken";
    else if (d.scheduledTime > now) status = "upcoming";
    else if (now - d.scheduledTime <= PENDING_WINDOW_MS) status = "pending";
    else status = "missed";
    return { ...d, status, takenAt: takenAt || null };
  });
}

function isDayComplete(dayKey) {
  const doses = getDosesForDate(dayKey);
  if (doses.length === 0) return false;
  return doses.every((d) => state.takenDoses[d.id]);
}

function recomputeStreak() {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!isDayComplete(dateKey(cursor))) {
    cursor.setTime(cursor.getTime() - MS_PER_DAY);
  }
  while (isDayComplete(dateKey(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - MS_PER_DAY);
  }
  state.streak = streak;
}

function getWeek() {
  const start = startOfWeek(new Date());
  const todayKey = dateKey(Date.now());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKey(d);
    const doses = getDosesForDate(key);
    const taken = doses.filter((x) => state.takenDoses[x.id]).length;
    let status;
    if (key > todayKey) status = "future";
    else if (key === todayKey) {
      if (doses.length > 0 && taken === doses.length) status = "taken";
      else if (taken > 0) status = "partial";
      else status = "pending";
    } else {
      if (doses.length > 0 && taken === doses.length) status = "taken";
      else if (taken > 0) status = "partial";
      else status = "missed";
    }
    days.push({
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      status,
      taken,
      total: doses.length,
    });
  }
  return days;
}

function matchOpenToDose(now) {
  const doses = getTodaySchedule();
  const candidates = doses.filter(
    (d) =>
      d.status !== "taken" && Math.abs(now - d.scheduledTime) <= MATCH_WINDOW_MS
  );
  if (candidates.length === 0) return null;
  let best = candidates[0];
  for (const c of candidates) {
    if (Math.abs(now - c.scheduledTime) < Math.abs(now - best.scheduledTime)) {
      best = c;
    }
  }
  return best;
}

function snapshot() {
  const todaySchedule = getTodaySchedule();
  const taken = todaySchedule.filter((d) => d.status === "taken").length;
  const total = todaySchedule.length;
  const nextDose =
    todaySchedule.find(
      (d) => d.status === "pending" || d.status === "upcoming"
    ) || null;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
  return {
    boxOpen: state.boxOpen,
    lastOpenedAt: state.lastOpenedAt,
    lastClosedAt: state.lastClosedAt,
    streak: state.streak,
    todaySchedule,
    todayStats: {
      taken,
      total,
      adherence,
      allDone: total > 0 && taken === total,
    },
    nextDose,
    events: state.events.slice(-50),
    week: getWeek(),
    family: state.family,
    medications: state.medications,
    pharmacy: state.pharmacy,
    orders: state.orders.slice(0, 8),
  };
}

function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

function recordEvent(type) {
  const now = Date.now();
  let matchedDose = null;

  if (type === "opened") {
    matchedDose = matchOpenToDose(now);
    if (matchedDose) {
      state.takenDoses[matchedDose.id] = now;
      const med = state.medications.find(
        (m) => m.id === matchedDose.medicationId
      );
      if (med && med.pillsLeft > 0) med.pillsLeft -= 1;
    }
  }

  const event = {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    timestamp: now,
    medication: matchedDose
      ? {
          id: matchedDose.medicationId,
          name: matchedDose.medicationName,
          time: matchedDose.time,
        }
      : null,
  };
  state.events.push(event);
  if (state.events.length > 200) state.events.shift();

  if (type === "opened") {
    state.boxOpen = true;
    state.lastOpenedAt = now;
    recomputeStreak();
  } else if (type === "closed") {
    state.boxOpen = false;
    state.lastClosedAt = now;
  }

  broadcast({ kind: "event", event, state: snapshot() });
  return event;
}

function createOrder({ medicationId, quantity }) {
  const med = state.medications.find((m) => m.id === medicationId);
  if (!med) return null;
  const pending = state.orders.find(
    (o) => o.medicationId === medicationId && o.status !== "delivered"
  );
  if (pending) return pending;

  const now = Date.now();
  const order = {
    id: `o-${now}-${Math.random().toString(36).slice(2, 6)}`,
    medicationId,
    medicationName: med.name,
    dosage: med.dosage,
    quantity: quantity || med.totalPills,
    status: "confirmed",
    createdAt: now,
    eta: now + state.pharmacy.deliveryEtaHours * 60 * 60 * 1000,
    pharmacy: state.pharmacy.name,
  };
  state.orders.unshift(order);
  if (state.orders.length > 20) state.orders.pop();
  broadcast({ kind: "order", order, state: snapshot() });

  setTimeout(() => advanceOrder(order.id, "dispatched"), 6000);
  setTimeout(() => advanceOrder(order.id, "delivered"), 14000);
  return order;
}

function advanceOrder(id, status) {
  const order = state.orders.find((o) => o.id === id);
  if (!order || order.status === "delivered") return;
  order.status = status;
  if (status === "delivered") {
    order.deliveredAt = Date.now();
    const med = state.medications.find((m) => m.id === order.medicationId);
    if (med) {
      med.pillsLeft = Math.min(med.totalPills, med.pillsLeft + order.quantity);
    }
  }
  broadcast({ kind: "order", order, state: snapshot() });
}

function seedDemoData() {
  const now = Date.now();
  for (let i = 1; i <= 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayKey = dateKey(d);
    const doses = getDosesForDate(dayKey);
    for (const dose of doses) {
      state.takenDoses[dose.id] = dose.scheduledTime + 5 * 60 * 1000;
    }
  }
  const todayDoses = getDosesForDate(dateKey(now));
  for (const dose of todayDoses) {
    if (dose.scheduledTime < now - 60 * 60 * 1000) {
      state.takenDoses[dose.id] = dose.scheduledTime + 5 * 60 * 1000;
    }
  }
  recomputeStreak();
}

seedDemoData();

app.get("/api/state", (_req, res) => {
  res.json(snapshot());
});

app.post("/api/sensor", (req, res) => {
  const { status } = req.body || {};
  if (status !== "opened" && status !== "closed") {
    return res
      .status(400)
      .json({ error: "status must be 'opened' or 'closed'" });
  }
  const event = recordEvent(status);
  res.json({ ok: true, event });
});

app.post("/api/simulate", (req, res) => {
  const { status } = req.body || {};
  if (status !== "opened" && status !== "closed") {
    return res
      .status(400)
      .json({ error: "status must be 'opened' or 'closed'" });
  }
  const event = recordEvent(status);
  res.json({ ok: true, event });
});

app.post("/api/reorder", (req, res) => {
  const { medicationId, quantity } = req.body || {};
  if (!medicationId) {
    return res.status(400).json({ error: "medicationId is required" });
  }
  const order = createOrder({ medicationId, quantity });
  if (!order) return res.status(404).json({ error: "medication not found" });
  res.json({ ok: true, order });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ kind: "snapshot", state: snapshot() }));
});

server.listen(PORT, () => {
  console.log(`SmartDabba backend listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
