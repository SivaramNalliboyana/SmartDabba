# SmartDabba

> _Caring from afar, one pill at a time._

SmartDabba turns an ordinary pill box into a connected, family-aware medication
companion. A magnet on the lid and a sensor on the body let the box know — to the
second — whenever it's opened or closed. That single signal becomes a real-time
update that flows from the box, through a backend, to a dashboard that anyone
in the family can watch from anywhere in the world.

## Demo

![SmartDabba dashboard alongside the ESP32 + magnet sensor rig](./demo.png)

_Left: the live dashboard showing today's adherence, weekly streak, and family
notifications. Right: the actual hardware — an ESP32 wired to a magnet sensor,
mounted on the pill box lid._

## The problem

Millions of elderly parents live alone or far away from their children. Forgetting
a dose, double-dosing, or skipping medication entirely is one of the most common
and most dangerous failure modes of aging in place. Existing solutions are either
clinical and intimidating (hospital-grade dispensers) or passive (paper charts,
phone reminders that only the patient sees).

What's missing is a **calm, ambient signal for the family** — something that says
"Dad took his evening pills" without anyone having to call and ask.

## What SmartDabba does

- **Detects every lid event.** A magnet + reed/hall sensor on the box reports
  every open and close to the cloud within a second.
- **Streams it live to the family.** Every connected dashboard updates in real
  time — son in San Francisco, daughter in London, doctor in Mumbai — all see
  the same state at the same time.
- **Frames events as a daily routine.** The dashboard knows the schedule, marks
  doses as taken / pending / missed, tracks streaks, and gives the family one
  glanceable answer to _"how are they doing today?"_
- **Keeps the family in the loop, not in the way.** When a dose is taken, family
  members get a soft notification and can react with a 👍 or ❤️ — no phone
  call needed.
- **Closes the supply loop.** When the box runs low, the dashboard surfaces a
  one-tap reorder with the family's preferred pharmacy.


## How it works

```
   ┌──────────────────┐        ┌─────────────────┐        ┌──────────────────┐
   │  Pill box lid    │  open  │   ESP32 + WiFi  │  POST  │   Node backend   │
   │  + magnet sensor │ ─────► │   (Arduino)     │ ─────► │   /api/sensor    │
   └──────────────────┘        └─────────────────┘        └────────┬─────────┘
                                                                   │
                                                                   │ logs event
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │  Family dashboard│
                                                          │  (React + Vite)  │
                                                          └──────────────────┘
```

1. **Sense.** A magnet on the lid sits over a reed switch (or A3144 hall sensor)
   on the body. Lid open → magnet leaves → digital pin flips.
2. **Debounce + send.** The ESP32 sketch waits for the reading to be stable
   (~500 ms) so contact bounce doesn't fire false events, then POSTs
   `{"status": "opened"}` or `{"status": "closed"}` to the backend over WiFi.
3. **Log + broadcast.** The backend logs each event with a timestamp and exposes
   the recent history at `/api/events`. (The full product also fans events out
   over WebSockets to every connected dashboard.)
4. **Show.** The React dashboard contextualizes the raw event — "Dad opened the
   box at 7:56 PM, that matches his Metformin 8 PM dose" — and updates the
   family circle in real time.

## Stack

- **Hardware**: ESP32 dev board + reed switch / A3144 hall sensor + magnet
- **Firmware**: Arduino / C++ (`magnet_detection.ino`)
- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Tailwind CSS
- **Storage**: in-memory (the demo backend resets on restart)

## Project layout

```
SmartPillBox/
├── magnet_detection.ino       # ESP32 firmware — debounces lid, POSTs to backend
├── backend/
│   ├── package.json
│   └── server.js              # Express server: /api/sensor, /api/events
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js         # proxies /api to :4000
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── useDabbaSocket.js
        └── components/
            ├── Header.jsx
            ├── StatusPanel.jsx
            ├── ActivityFeed.jsx
            ├── WeeklyGrid.jsx
            ├── FamilyPanel.jsx
            ├── MedicineInventory.jsx
            ├── PharmacyCard.jsx
            └── TodaySchedule.jsx
```

## Run it

Open two terminals.

### 1. Backend

```bash
cd backend
npm install
npm run dev
# → http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend, so the same code
works in development and behind a single host in production.

## Backend API

| Method | Path           | Body                                  | Notes                                                  |
| ------ | -------------- | ------------------------------------- | ------------------------------------------------------ |
| POST   | `/api/sensor`  | `{ "status": "opened" \| "closed" }`  | **ESP32 hits this.** Logs and stores the event.        |
| GET    | `/api/events`  | —                                     | Recent open/close log (most recent 500).               |
| GET    | `/api/health`  | —                                     | Liveness check.                                        |

Every event also prints a one-line log to the backend console, e.g.:

```
[2026-05-09T19:56:04.812Z] LID OPENED
[2026-05-09T19:56:31.105Z] LID CLOSED
```

## Try it without an ESP32

You can drive the backend with `curl`:

```bash
curl -X POST http://localhost:4000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"status":"opened"}'
```

Then check `GET /api/events` to see your event in the log.

## Hardware setup

- **Microcontroller**: any ESP32 dev board (powered over USB).
- **Sensor**: a reed switch is cheapest and most reliable for a lid. An A3144
  hall-effect sensor works too if you prefer solid-state.
- **Magnet**: a small neodymium disc glued to the inside of the lid, positioned
  so it sits within ~5 mm of the sensor when the lid is closed.
- **Wiring** (reed switch with internal pull-up):
  ```
  Reed switch lead 1 → ESP32 GPIO 4
  Reed switch lead 2 → GND
  GPIO 4 also weakly tied to 3.3V via INPUT_PULLUP (or a 10kΩ pull-up resistor)
  ```
- Set your WiFi SSID, password, and the laptop's LAN IP at the top of
  `magnet_detection.ino`, flash the board, and watch the serial monitor at
  115200 baud for `POST opened -> 200`.
