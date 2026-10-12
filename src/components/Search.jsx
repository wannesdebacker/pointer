import { createSignal, For, Show } from "solid-js";

let timer;

export function Search(props) {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal([]);
  const [open, setOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  function search(q) {
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" } }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }

  function onInput(e) {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timer);
    timer = setTimeout(() => search(v), 350);
  }

  function pick(r) {
    setQuery(r.display_name.split(",")[0]);
    setResults([]);
    setOpen(false);
    props.onSelect({
      name: r.display_name.split(",").slice(0, 2).join(","),
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    });
  }

  return (
    <div class="search">
      <input
        type="search"
        placeholder="Town or address…"
        value={query()}
        onInput={onInput}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autocapitalize="off"
        autocomplete="off"
      />
      <Show when={open() && (results().length > 0 || loading())}>
        <ul class="results">
          <Show when={loading()}>
            <li class="muted">Searching…</li>
          </Show>
          <For each={results()}>
            {(r) => (
              <li onMouseDown={() => pick(r)}>
                <strong>{r.display_name.split(",")[0]}</strong>
                <span class="muted">{r.display_name.split(",").slice(1, 4).join(",")}</span>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
