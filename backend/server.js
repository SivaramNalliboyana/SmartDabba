import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const events = [];

function logEvent(status) {
  const ts = new Date();
  const event = { status, timestamp: ts.toISOString() };
  events.push(event);
  if (events.length > 500) events.shift();
  console.log(`[${ts.toISOString()}] LID ${status.toUpperCase()}`);
  return event;
}

app.post("/api/sensor", (req, res) => {
  const { status } = req.body || {};
  if (status !== "opened" && status !== "closed") {
    return res
      .status(400)
      .json({ error: "status must be 'opened' or 'closed'" });
  }
  const event = logEvent(status);
  res.json({ ok: true, event });
});

app.get("/api/events", (_req, res) => {
  res.json({ count: events.length, events });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`SmartDabba backend listening on http://localhost:${PORT}`);
  console.log(`POST /api/sensor   {"status":"opened"|"closed"}`);
  console.log(`GET  /api/events   recent open/close log`);
});
