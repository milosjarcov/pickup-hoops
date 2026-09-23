import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "../lib/maplibre";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { applyOverrides, MAP_CREDITS } from "../lib/mapStyles";

// The app's basemap: a MapLibre GL vector style drawn as one layer inside
// Leaflet. Vector maps stay sharp at every zoom level and can be recolored
// after loading. Leaflet still owns everything else: panning, zoom, and pins.
export default function VectorBasemap({ styleUrl, overrides = [] }) {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: styleUrl,
      // Handed to Leaflet's credits box. The plugin can't read credits from
      // the style itself until it has loaded, which is too late for Leaflet.
      attributionControl: { customAttribution: MAP_CREDITS },
    }).addTo(map);

    const gl = layer.getMaplibreMap();
    gl.on("style.load", () => applyOverrides(gl, overrides));

    return () => {
      map.removeLayer(layer);
    };
  }, [map, styleUrl, overrides]);

  return null;
}
