import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { initials, isSoon } from "../lib/format";
import AuthModal from "../components/AuthModal";
import CourtPanel from "../components/CourtPanel";
import RunsRail from "../components/RunsRail";
import { BallMark } from "../components/icons";

const MONTREAL_CENTER = [45.515, -73.6];

/**
 * Markers are plain HTML (divIcon) rather than Leaflet's default pin images,
 * so they are styled from index.css and can carry state: outlined when a court
 * is quiet, flame when runs are posted, pulsing chalk when one starts soon.
 */
function courtIcon({ count, soon, active }) {
  const classes = [
    "pin",
    count > 0 ? "has-runs" : "",
    soon ? "is-soon" : "",
    active ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "pin-wrap",
    html: `<span class="${classes}">${count || ""}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/**
 * Frame the courts instead of the city. Without this the default view wastes
 * half the map on the South Shore, where there is nothing to click.
 * Has to be a child of MapContainer, since useMap reads it from context.
 */
function FitToCourts({ courts }) {
  const map = useMap();
  useEffect(() => {
    if (courts.length === 0) return;
    const bounds = L.latLngBounds(courts.map((c) => [c.latitude, c.longitude]));
    // Padding is deliberately small: on a short map pane (the stacked mobile
    // layout) generous padding forces the zoom way out to make room for it.
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 });
  }, [courts, map]);
  return null;
}

export default function MapPage() {
  const { user, logout, openAuth } = useAuth();
  const [courts, setCourts] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [hoveredCourtId, setHoveredCourtId] = useState(null);

  // Both endpoints are public, so this loads for signed-out visitors too.
  const loadRuns = useCallback(() => api("/runs").then(setRuns).catch(console.error), []);

  useEffect(() => {
    api("/courts").then(setCourts).catch(console.error);
    loadRuns();
  }, [loadRuns]);

  const runsByCourt = useMemo(() => {
    const map = new Map();
    for (const run of runs) {
      if (!map.has(run.court_id)) map.set(run.court_id, []);
      map.get(run.court_id).push(run);
    }
    return map;
  }, [runs]);

  const activeCourtId = selectedCourt?.id ?? hoveredCourtId;

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">
          <BallMark />
          Pickup<em>Hoops</em>
        </span>
        <span className="topbar-city">
          <span className="label">Montreal</span>
        </span>
        <span className="topbar-spacer" />
        <span className="topbar-right">
          {user ? (
            <>
              <span className="whoami">
                <span className="who">{initials(user.name)}</span>
                <span className="whoami-name">{user.name}</span>
              </span>
              <button className="link-btn" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <button className="ghost" onClick={() => openAuth()}>
              Sign in
            </button>
          )}
        </span>
      </header>

      <div className="workspace">
        <aside className="rail">
          {selectedCourt ? (
            <CourtPanel
              court={selectedCourt}
              runs={runsByCourt.get(selectedCourt.id) ?? []}
              onBack={() => setSelectedCourt(null)}
              onChanged={loadRuns}
            />
          ) : (
            <RunsRail
              runs={runs}
              courts={courts}
              onSelectCourt={setSelectedCourt}
              onHoverCourt={setHoveredCourtId}
            />
          )}
        </aside>

        <div className="mapwrap">
          <MapContainer center={MONTREAL_CENTER} zoom={12} className="map">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FitToCourts courts={courts} />
            {courts.map((court) => {
              const courtRuns = runsByCourt.get(court.id) ?? [];
              return (
                <Marker
                  key={court.id}
                  position={[court.latitude, court.longitude]}
                  icon={courtIcon({
                    count: courtRuns.length,
                    soon: courtRuns.some((r) => isSoon(r.starts_at)),
                    active: activeCourtId === court.id,
                  })}
                  eventHandlers={{
                    click: () => setSelectedCourt(court),
                    mouseover: () => setHoveredCourtId(court.id),
                    mouseout: () => setHoveredCourtId(null),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -14]}>
                    {court.name}
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="legend">
            <span className="legend-row">
              <i className="legend-dot soon" /> Starting soon
            </span>
            <span className="legend-row">
              <i className="legend-dot posted" /> Runs posted
            </span>
            <span className="legend-row">
              <i className="legend-dot" /> No runs yet
            </span>
          </div>
        </div>
      </div>

      <AuthModal />
    </div>
  );
}
