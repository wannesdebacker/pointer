import { createSignal } from "solid-js";

export function useGeolocation() {
  const [pos, setPos] = createSignal(null);
  const [error, setError] = createSignal(null);
  const [status, setStatus] = createSignal("idle"); // idle | locating | ready | error

  function locate() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser");
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy });
        setError(null);
        setStatus("ready");
      },
      (e) => {
        setError(e.message || "Could not get your position");
        setStatus("error");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }

  return { pos, error, status, locate };
}
