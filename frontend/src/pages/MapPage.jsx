import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttributionControl, MapContainer, Marker, ZoomControl } from "react-leaflet";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import L from "leaflet";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import AccountMenu from "../components/AccountMenu";
import AppIcon from "../components/AppIcon";
import CourtList from "../components/CourtList";
import CourtPanel from "../components/CourtPanel";
import Toast from "../components/Toast";
import VectorBasemap from "../components/VectorBasemap";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { matchesQuery } from "../lib/format";
import { DARK_MAP, LIGHT_MAP } from "../lib/mapStyles";
import { pinHtml } from "../lib/pin";
import { groupByCourt } from "../lib/runs";

const MONTREAL_CENTER = [45.515, -73.6];
const PHONE_QUERY = "(max-width: 700px)";

// On phones the sidebar becomes a bottom sheet. This is its resting height as
// a fraction of the screen. It's set from here (as a CSS variable) so the map
// math below and the stylesheet can't drift apart.
const SHEET_PEEK = 0.46;

// Icons are cached because handing Leaflet a new icon object makes it rebuild
// the marker's DOM, which would happen on every keystroke in the search box.
const iconCache = new Map();

function courtIcon(name, selected, delay) {
  const key = `${name}|${selected}|${delay}`;
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      L.divIcon({
        className: selected ? "pin is-selected" : "pin",
        html: pinHtml(name, delay),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    );
  }
  return iconCache.get(key);
}

// The app itself. Anyone can browse it; signing in only matters once you
// join or post a run (CourtPanel handles that).
export default function MapPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courts, setCourts] = useState(null); // null until the first load finishes
  const [runs, setRuns] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [map, setMap] = useState(null);
  const sidebarRef = useRef(null);
  const framedOnce = useRef(false);
  // A court in the URL (/map?court=3) opens straight to that court.
  const linkedCourtId = useRef(Number(searchParams.get("court")) || null);
  const dark = useMediaQuery("(prefers-color-scheme: dark)");

  const load = useCallback(() => {
    setLoadError(null);
    Promise.all([api("/courts"), api("/runs")])
      .then(([courtList, runList]) => {
        setCourts(courtList);
        setRuns(runList);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // One list of upcoming runs for the whole city, split per court here. The
  // court list and the court panel both read from it, so they always agree.
  const refreshRuns = useCallback(() => api("/runs").then(setRuns), []);
  const runsByCourt = useMemo(() => groupByCourt(runs), [runs]);

  const showToast = useCallback((message) => setToast({ id: Date.now(), message }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const visibleCourts = useMemo(
    () => (courts ?? []).filter((court) => matchesQuery(court, query)),
    [courts, query],
  );
  const selectedCourt = courts?.find((court) => court.id === selectedId) ?? null;

  // Each pin waits its turn when they first drop onto the map.
  const dropDelay = useMemo(() => new Map((courts ?? []).map((c, i) => [c.id, 300 + i * 70])), [courts]);

  // The sidebar floats on top of the map and hides part of it: the left edge
  // on a desktop, the bottom on a phone. Returns the covered pixels per side.
  const coveredInsets = useCallback(() => {
    if (window.matchMedia(PHONE_QUERY).matches) {
      return { left: 0, bottom: map.getSize().y * SHEET_PEEK };
    }
    const mapLeft = map.getContainer().getBoundingClientRect().left;
    return { left: sidebarRef.current.getBoundingClientRect().right - mapLeft, bottom: 0 };
  }, [map]);

  // Fly to a court, but center it in the part of the map you can actually
  // see. Leaflet only knows how to center on the whole map, so we shift the
  // target point by half the covered area before asking it to fly there.
  const focusCourt = useCallback(
    (court, animate = true) => {
      if (!map) return;
      const { left, bottom } = coveredInsets();
      const zoom = Math.max(map.getZoom(), 15);
      const target = map.project([court.latitude, court.longitude], zoom);
      const center = map.unproject(target.add([-left / 2, bottom / 2]), zoom);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (animate && !reduceMotion) map.flyTo(center, zoom, { duration: 0.8 });
      else map.setView(center, zoom, { animate: false });
    },
    [map, coveredInsets],
  );

  // First view, once both the map and the data exist: the linked court if
  // there is one, otherwise every court in frame. The pins drop in either way.
  useEffect(() => {
    if (!map || !courts?.length || framedOnce.current) return;
    framedOnce.current = true;

    // Pins play their drop-in animation until the map is marked settled.
    // After that, pins that get re-created (on select, or after a search)
    // just appear instead of dropping again.
    const container = map.getContainer();
    setTimeout(() => container.classList.add("pins-settled"), 1800);

    const linked = courts.find((c) => c.id === linkedCourtId.current);
    if (linked) {
      setSelectedId(linked.id);
      focusCourt(linked, false);
      return;
    }
    const { left, bottom } = coveredInsets();
    const bounds = L.latLngBounds(courts.map((c) => [c.latitude, c.longitude]));
    map.fitBounds(bounds, {
      // Extra room on the right because court names sit to the right of pins.
      paddingTopLeft: [left + 40, 50],
      paddingBottomRight: [140, bottom + 40],
      maxZoom: 14,
      animate: false,
    });
  }, [map, courts, coveredInsets, focusCourt]);

  // Court names crowd each other when zoomed far out, so fade them below zoom 12.
  useEffect(() => {
    if (!map) return;
    const update = () => map.getContainer().classList.toggle("is-zoomed-out", map.getZoom() < 12);
    update();
    map.on("zoomend", update);
    return () => map.off("zoomend", update);
  }, [map]);

  // Keep the URL in step with the open court, so it can be shared or reloaded.
  // replace: true stops every tap from adding a history entry.
  function selectCourt(court) {
    setSelectedId(court.id);
    setSheetExpanded(false);
    setSearchParams({ court: String(court.id) }, { replace: true });
    focusCourt(court);
  }

  function closeCourt() {
    setSelectedId(null);
    setSearchParams({}, { replace: true });
  }

  let account = null;
  if (user) account = <AccountMenu />;
  else if (!loading)
    account = (
      <Link to="/login" state={{ from: location.pathname + location.search }} className="btn-text sidebar-sign-in">
        Sign In
      </Link>
    );

  return (
    <div className="map-page">
      <MapContainer
        ref={setMap}
        center={MONTREAL_CENTER}
        zoom={12}
        minZoom={10}
        zoomControl={false}
        attributionControl={false}
        className="map"
      >
        <VectorBasemap {...(dark ? DARK_MAP : LIGHT_MAP)} />
        <ZoomControl position="bottomright" />
        <AttributionControl position="bottomright" prefix='<a href="https://leafletjs.com">Leaflet</a>' />
        {visibleCourts.map((court) => {
          const selected = court.id === selectedId;
          return (
            <Marker
              key={court.id}
              position={[court.latitude, court.longitude]}
              icon={courtIcon(court.name, selected, dropDelay.get(court.id))}
              zIndexOffset={selected ? 1000 : 0}
              eventHandlers={{
                click: () => selectCourt(court),
                // Pins are focusable with Tab; let Enter open them too.
                keypress: (e) => e.originalEvent.key === "Enter" && selectCourt(court),
              }}
            />
          );
        })}
      </MapContainer>

      <aside
        ref={sidebarRef}
        className={sheetExpanded ? "sidebar is-expanded" : "sidebar"}
        style={{ "--sheet-peek": `${SHEET_PEEK * 100}%` }}
        aria-label="Courts"
      >
        <button
          type="button"
          className="sheet-grabber"
          aria-label={sheetExpanded ? "Collapse panel" : "Expand panel"}
          aria-expanded={sheetExpanded}
          onClick={() => setSheetExpanded((e) => !e)}
        />
        <header className="sidebar-header">
          <Link to="/" className="brand">
            <AppIcon size={28} />
            <span>Pickup Hoops</span>
          </Link>
          {account}
        </header>

        {selectedCourt ? (
          // key: switching courts remounts the panel, which resets its
          // state (errors, open sheets) and replays the slide-in.
          <CourtPanel
            key={selectedCourt.id}
            court={selectedCourt}
            runs={runsByCourt.get(selectedCourt.id) ?? []}
            onBack={closeCourt}
            onRunsChanged={refreshRuns}
            onToast={showToast}
          />
        ) : (
          <CourtList
            courts={courts === null ? null : visibleCourts}
            runsByCourt={runsByCourt}
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              if (value) setSheetExpanded(true);
            }}
            onSelect={selectCourt}
            error={loadError}
            onRetry={load}
          />
        )}
      </aside>

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
