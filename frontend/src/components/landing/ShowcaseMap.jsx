import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MapLibreMap, Marker } from "../../lib/maplibre";
import { addBuildings, applyOverrides, DARK_MAP, LIGHT_MAP } from "../../lib/mapStyles";
import { pinHtml } from "../../lib/pin";

const MONTREAL = [-73.595, 45.512];
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Web Mercator position of a point, 0 to 1 across the whole world. Used to
// work out how far to zoom so every court fits on screen.
function mercator([lng, lat]) {
  const sin = Math.sin((lat * Math.PI) / 180);
  return { x: (lng + 180) / 360, y: 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI) };
}

// Center and zoom that fit every court inside the visible part of the map,
// seen tilted back by `pitch` degrees.
function overviewCamera(courts, width, height, pitch) {
  const points = courts.map((c) => mercator([c.longitude, c.latitude]));
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  // Tilting the map squashes north-south distances, but perspective also
  // stretches the near (bottom) half, so meet cos(pitch) halfway.
  const tilt = (1 + Math.cos((pitch * Math.PI) / 180)) / 2;
  const spanY = (Math.max(...ys) - Math.min(...ys)) * tilt;
  // MapLibre's world is 512 px wide at zoom 0 and doubles with each level.
  // The small back-off leaves room for the slow orbit swinging courts around.
  const zoom = Math.log2(Math.min(width / (spanX * 512), height / (spanY * 512))) - 0.2;
  const lngs = courts.map((c) => c.longitude);
  const lats = courts.map((c) => c.latitude);
  return {
    center: [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2],
    zoom: Math.min(zoom, 13.5),
  };
}

const OVERVIEW_PITCH = 50;

// The landing page's centerpiece: the real map, tilted into 3D, drifting
// around Montreal and flying to a court when the story below asks it to.
// It isn't interactive; "Open the Map" leads to the real thing.
//
// padding: how much of each edge is covered by the story's panels and text,
// so the camera centers things in the part you can actually see.
// running: false while the map is off screen, to stop animating for nothing.
export default function ShowcaseMap({ courts, focusCourt, padding, running }) {
  const containerRef = useRef(null);
  const markerEls = useRef(new Map());
  const [map, setMap] = useState(null);
  const dark = useMediaQuery("(prefers-color-scheme: dark)");

  // Create the map, and recreate it when the system switches light/dark.
  useEffect(() => {
    const theme = dark ? DARK_MAP : LIGHT_MAP;
    const gl = new MapLibreMap({
      container: containerRef.current,
      style: theme.styleUrl,
      center: MONTREAL,
      zoom: 11.4,
      pitch: 50,
      bearing: -18,
      interactive: false,
      attributionControl: false,
    });
    gl.on("style.load", () => {
      applyOverrides(gl, theme.overrides);
      addBuildings(gl, theme.buildingColor);
    });
    gl.once("load", () => setMap(gl));
    return () => {
      setMap(null);
      gl.remove();
    };
  }, [dark]);

  // Court pins, the same markup as the app's. They drop in one by one.
  useEffect(() => {
    if (!map || !courts) return;
    const elements = new Map();
    const markers = courts.map((court, i) => {
      const el = document.createElement("div");
      el.className = "pin showcase-pin";
      el.innerHTML = pinHtml(court.name, 250 + i * 120);
      elements.set(court.id, el);
      return new Marker({ element: el }).setLngLat([court.longitude, court.latitude]).addTo(map);
    });
    markerEls.current = elements;
    return () => markers.forEach((marker) => marker.remove());
  }, [map, courts]);

  useEffect(() => {
    for (const [id, el] of markerEls.current) el.classList.toggle("is-selected", id === focusCourt?.id);
  }, [map, courts, focusCourt]);

  // The camera. Each time the story moves on, fly to the new view, then
  // keep slowly circling it. `cancelled` stops an old orbit from carrying on
  // after the next move has started.
  const paddingKey = JSON.stringify(padding);
  useEffect(() => {
    if (!map || !courts?.length) return;
    if (!running) {
      map.stop();
      return;
    }
    const pad = JSON.parse(paddingKey);
    const reduceMotion = window.matchMedia(REDUCED_MOTION).matches;
    let cancelled = false;

    function orbit() {
      if (cancelled || reduceMotion) return;
      map.easeTo({ bearing: map.getBearing() + 24, duration: 14000, easing: (t) => t, padding: pad });
      map.once("moveend", () => orbit());
    }

    let camera;
    if (focusCourt) {
      camera = {
        center: [focusCourt.longitude, focusCourt.latitude],
        zoom: 15.6,
        pitch: 62,
        bearing: map.getBearing() + 50,
      };
    } else {
      const { clientWidth, clientHeight } = map.getContainer();
      const visibleWidth = clientWidth - pad.left - pad.right - 160;
      const visibleHeight = clientHeight - pad.top - pad.bottom - 40;
      camera = {
        ...overviewCamera(courts, visibleWidth, visibleHeight, OVERVIEW_PITCH),
        pitch: OVERVIEW_PITCH,
        bearing: -18,
      };
    }

    map.flyTo({ ...camera, padding: pad, duration: reduceMotion ? 0 : 2600, curve: 1.3 });
    map.once("moveend", () => orbit());

    return () => {
      cancelled = true;
    };
  }, [map, courts, focusCourt, paddingKey, running]);

  return <div ref={containerRef} className={map ? "showcase-map is-ready" : "showcase-map"} />;
}
