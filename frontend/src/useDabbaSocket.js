import { useEffect, useRef, useState } from "react";

const WS_URL = (() => {
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws`;
})();

export function useDabbaSocket() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const retryRef = useRef(0);
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.state) setState(data.state);
          if (data.kind === "event" && data.event) setLastEvent(data.event);
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (cancelled) return;
        retryRef.current = Math.min(retryRef.current + 1, 6);
        const delay = 500 * 2 ** (retryRef.current - 1);
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();
    return () => {
      cancelled = true;
      socketRef.current?.close();
    };
  }, []);

  async function simulate(status) {
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function reorder(medicationId, quantity) {
    const res = await fetch("/api/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicationId, quantity }),
    });
    if (!res.ok) throw new Error("reorder failed");
    return res.json();
  }

  return { state, connected, lastEvent, simulate, reorder };
}
