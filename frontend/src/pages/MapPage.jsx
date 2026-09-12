import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { initials } from "../utils";
import CourtPanel from "../components/CourtPanel";
import Ball, { BALL_SVG } from "../components/Ball";

const MONTREAL_CENTER = [45.515, -73.6];

function courtIcon(selected) {
  return L.divIcon({
    className: "",
    html: `<div class="court-marker${selected ? " selected" : ""}">${BALL_SVG}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function MapPage() {
  const { user, logout } = useAuth();
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);

  useEffect(() => {
    api("/courts").then(setCourts).catch(console.error);
  }, []);

  return (
    <div className="map-page">
      <header className="topbar">
        <span className="brand">
          <span className="ball"><Ball /></span>
          Pickup Hoops
        </span>
        <span className="topbar-right">
          <span className="user-chip">
            <span className="avatar">{initials(user?.name)}</span>
            {user?.name}
          </span>
          <button className="ghost" onClick={logout}>
            Log out
          </button>
        </span>
      </header>
      <div className="map-layout">
        <MapContainer center={MONTREAL_CENTER} zoom={12} className="map">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ | Data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {courts.map((court) => (
            <Marker
              key={court.id}
              position={[court.latitude, court.longitude]}
              icon={courtIcon(selectedCourt?.id === court.id)}
              eventHandlers={{ click: () => setSelectedCourt(court) }}
            >
              <Tooltip>{court.name}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
        {selectedCourt && (
          <CourtPanel
            court={selectedCourt}
            onClose={() => setSelectedCourt(null)}
          />
        )}
      </div>
    </div>
  );
}
