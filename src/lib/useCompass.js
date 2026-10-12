import { createSignal, onCleanup } from "solid-js";

const deg2rad = Math.PI / 180;
const rad2deg = 180 / Math.PI;

function tiltCompensatedHeading(alpha, beta, gamma) {
  const _x = (beta ?? 0) * deg2rad;
  const _y = (gamma ?? 0) * deg2rad;
  const _z = (alpha ?? 0) * deg2rad;

  const cX = Math.cos(_x);
  const cY = Math.cos(_y);
  const cZ = Math.cos(_z);
  const sX = Math.sin(_x);
  const sY = Math.sin(_y);
  const sZ = Math.sin(_z);

  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;

  let h = Math.atan(Vx / Vy);
  if (Vy < 0) h += Math.PI;
  else if (Vx < 0) h += 2 * Math.PI;

  return h * rad2deg;
}

export function useCompass() {
  const [heading, setHeading] = createSignal(null);
  const [state, setState] = createSignal("idle");

  const supported =
    typeof window !== "undefined" && "DeviceOrientationEvent" in window;
  const needsGesture =
    supported && typeof DeviceOrientationEvent.requestPermission === "function";

  function attach() {
    const useAbsolute = "ondeviceorientationabsolute" in window;
    const evt = useAbsolute ? "deviceorientationabsolute" : "deviceorientation";

    const handler = (e) => {
      let h;
      if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) {
        h = e.webkitCompassHeading;
      } else if (e.absolute || useAbsolute || e.alpha != null) {
        h = tiltCompensatedHeading(e.alpha, e.beta, e.gamma);
      }
      if (h == null || !Number.isFinite(h)) return;
      h = ((h % 360) + 360) % 360;
      setHeading((prev) => {
        if (prev == null) return h;
        const a = prev * deg2rad;
        const b = h * deg2rad;
        const x = 0.8 * Math.cos(a) + 0.2 * Math.cos(b);
        const y = 0.8 * Math.sin(a) + 0.2 * Math.sin(b);
        return ((Math.atan2(y, x) * rad2deg) + 360) % 360;
      });
      setState("active");
    };

    window.addEventListener(evt, handler, true);
    onCleanup(() => window.removeEventListener(evt, handler, true));
  }

  async function enable() {
    if (!supported) {
      setState("unsupported");
      return;
    }
    if (needsGesture) {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== "granted") {
          setState("denied");
          return;
        }
      } catch {
        setState("denied");
        return;
      }
    }
    attach();
    setState("active");
  }

  if (supported && !needsGesture) {
    attach();
    setState("active");
  } else if (needsGesture) {
    setState("needs-permission");
  } else {
    setState("unsupported");
  }

  return { heading, state, enable, needsGesture };
}
