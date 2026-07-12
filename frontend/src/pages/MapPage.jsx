import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import CourtPanel from "../components/CourtPanel";

// Leaflet's default marker images don't survive bundling; point it at the
// copies Vite serves from the leaflet package. Classic Leaflet+bundler fix —
// _getIconUrl must go first or Leaflet keeps guessing (wrong) paths.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MONTREAL_CENTER = [45.515, -73.6];

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
        <span className="brand">🏀 Pickup Hoops</span>
        <span className="topbar-right">
          {user?.name}
          <button className="link-btn" onClick={logout}>
            Log out
          </button>
        </span>
      </header>
      <div className="map-layout">
        <MapContainer center={MONTREAL_CENTER} zoom={12} className="map">
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {courts.map((court) => (
            <Marker
              key={court.id}
              position={[court.latitude, court.longitude]}
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
