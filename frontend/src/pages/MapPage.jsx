import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { initials } from "../utils";
import CourtPanel from "../components/CourtPanel";
import Ball from "../components/Ball";

const MONTREAL_CENTER = [45.515, -73.6];

function courtIcon(number, selected, delayMs) {
  return L.divIcon({
    className: "",
    html: `<div class="court-pin${selected ? " selected" : ""}" style="animation-delay:${delayMs}ms"><span>${number}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [15, 30],
  });
}

export default function MapPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const mapRef = useRef(null);

  const loadRuns = () => api("/runs").then(setRuns).catch(console.error);

  useEffect(() => {
    api("/courts").then(setCourts).catch(console.error);
    loadRuns();
  }, []);

  const runsByCourt = useMemo(() => {
    const counts = {};
    for (const run of runs) counts[run.court_id] = (counts[run.court_id] ?? 0) + 1;
    return counts;
  }, [runs]);

  function selectCourt(court) {
    setSelectedCourt(court);
    mapRef.current?.flyTo([court.latitude - 0.015, court.longitude], 14, {
      duration: 0.6,
    });
  }

  const ticker = `FIND A RUN — PICK A COURT — SHOW UP — ${courts.length} COURTS · MONTRÉAL — `;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-sm">
          <span className="ball"><Ball /></span>
          Pickup Hoops
        </div>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-inner">
            {ticker}
            {ticker}
            {ticker}
            {ticker}
          </div>
        </div>
        <div className="top-right">
          {token ? (
            <>
              <span className="user-chip">
                <span className="avatar">{initials(user?.name)}</span>
                {user?.name}
              </span>
              <button onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Log in</button>
              <button className="primary" onClick={() => navigate("/register")}>
                Sign up
              </button>
            </>
          )}
        </div>
      </header>
      <div className="main">
        <aside className="rail">
          {selectedCourt ? (
            <CourtPanel
              court={selectedCourt}
              onBack={() => setSelectedCourt(null)}
              onChanged={loadRuns}
            />
          ) : (
            <>
              <div className="rail-head">
                {!token && (
                  <span className="hero-ball"><Ball /></span>
                )}
                <h1>
                  Pickup
                  <br />
                  Hoops
                </h1>
                {token ? (
                  <p className="tagline">
                    {courts.length} courts · {runs.length} upcoming runs ·
                    Montréal
                  </p>
                ) : (
                  <>
                    <p className="hero-pitch">
                      Pickup basketball,
                      <br />
                      minus the group chat.
                    </p>
                    <p className="tagline">
                      {courts.length} courts · {runs.length} upcoming runs ·
                      Montréal
                    </p>
                    <div className="hero-cta">
                      <button
                        className="primary"
                        onClick={() => navigate("/register")}
                      >
                        Join a run
                      </button>
                      <button
                        className="ghost"
                        onClick={() => navigate("/login")}
                      >
                        Log in
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="rail-label">
                {token ? "Court index — pick one" : "Browse the courts — free to look"}
              </div>
              <ol className="court-index">
                {courts.map((court, i) => (
                  <li key={court.id}>
                    <button
                      className="court-row"
                      onClick={() => selectCourt(court)}
                    >
                      <span className="court-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="court-meta">
                        <strong>{court.name}</strong>
                        <small>{court.address}</small>
                      </span>
                      {runsByCourt[court.id] > 0 && (
                        <span className="run-count">
                          {runsByCourt[court.id]} run
                          {runsByCourt[court.id] === 1 ? "" : "s"}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>
        <div className="map-wrap">
          <MapContainer
            center={MONTREAL_CENTER}
            zoom={12}
            className="map"
            ref={mapRef}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ | Data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {courts.map((court, i) => (
              <Marker
                key={court.id}
                position={[court.latitude, court.longitude]}
                icon={courtIcon(
                  String(i + 1).padStart(2, "0"),
                  selectedCourt?.id === court.id,
                  300 + i * 80,
                )}
                eventHandlers={{ click: () => selectCourt(court) }}
              >
                <Tooltip>{court.name}</Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
