import { createSignal, createMemo, createEffect, Show, onMount } from "solid-js";
import { Search } from "./components/Search.jsx";
import { useCompass } from "./lib/useCompass.js";
import { useGeolocation } from "./lib/useGeolocation.js";
import { bearingDegrees, distanceMeters, formatDistance, formatBearing } from "./lib/geo.js";

export default function App() {
  const geo = useGeolocation();
  const compass = useCompass();
  const [target, setTarget] = createSignal(null);
  const [arrowAngle, setArrowAngle] = createSignal(0);
  let lastArrow = 0;

  onMount(() => geo.locate());

  const secure = typeof window !== "undefined" && window.isSecureContext;

  const bearing = createMemo(() => {
    const p = geo.pos();
    const t = target();
    if (!p || !t) return null;
    return bearingDegrees(p, t);
  });

  const distance = createMemo(() => {
    const p = geo.pos();
    const t = target();
    if (!p || !t) return null;
    return distanceMeters(p, t);
  });

  createEffect(() => {
    const b = bearing();
    if (b == null) return;
    const h = compass.heading();
    const raw = h == null ? b : b - h;
    const delta = ((raw - lastArrow + 540) % 360) - 180;
    lastArrow += delta;
    setArrowAngle(lastArrow);
  });

  const aligned = createMemo(() => {
    const b = bearing();
    const h = compass.heading();
    if (b == null || h == null) return false;
    const delta = Math.abs(((b - h + 540) % 360) - 180);
    return delta < 6;
  });

  const compassReady = createMemo(() => compass.heading() != null);

  return (
    <div class="app">
      <header>
        <h1>Pointer</h1>
        <Search onSelect={setTarget} />
      </header>

      <main>
        <Show when={!secure}>
          <p class="warn">
            Not a secure context — Android blocks compass &amp; location. Use the https:// URL.
          </p>
        </Show>

        <Show when={!target()} fallback={<Dial />}>
          <p class="hint">Search a town or address. The arrow points at it.</p>
        </Show>
      </main>

      <footer>
        <Show when={compass.state() === "needs-permission"}>
          <button onClick={compass.enable}>Enable compass</button>
        </Show>
        <Show when={compass.state() === "denied"}>
          <span class="warn">Compass permission denied.</span>
        </Show>
        <Show when={compass.state() === "unsupported"}>
          <span class="warn">Compass not supported on this device.</span>
        </Show>
        <Show when={compass.state() === "active" && !compassReady()}>
          <span class="muted">Waiting for compass…</span>
        </Show>
        <Show when={geo.status() === "locating"}>
          <span class="muted">Getting your position…</span>
        </Show>
        <Show when={geo.error()}>
          <span class="warn">{geo.error()}</span>
        </Show>
      </footer>
    </div>
  );

  function Dial() {
    return (
      <div class="dial" classList={{ aligned: aligned() }}>
        <div class="dial-ring">
          <span class="n">N</span>
          <div class="arrow" style={{ transform: `rotate(${arrowAngle()}deg)` }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <path d="M50 8 L72 78 L50 66 L28 78 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div class="info">
          <strong>{target()?.name}</strong>
          <Show when={distance() != null}>
            <span>{formatDistance(distance())}</span>
          </Show>
          <Show when={bearing() != null}>
            <span class="muted">
              {Math.round(bearing())}° {formatBearing(bearing())}
            </span>
          </Show>
          <Show when={aligned()}>
            <span class="aligned-badge">You're pointing at it</span>
          </Show>
          <Show when={!compassReady()}>
            <span class="muted">Static bearing — no compass data</span>
          </Show>
        </div>
      </div>
    );
  }
}
