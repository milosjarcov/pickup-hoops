// Two OpenFreeMap vector styles (free, no API key), recolored toward Apple
// Maps. Shared by the app's map and the landing page's 3D map.
//
// Liberty (light) paints main roads yellow and orange, which fights with the
// orange court pins, so streets go white and only highways keep a soft
// yellow. The dark style is nearly black with water the same color as land,
// so it gets Apple's warmer grays, a navy for water, and a dark green for parks.
//
// Each override is [layer id pattern, property, value].

export const MAP_CREDITS =
  '<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const LIGHT_MAP = {
  styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  overrides: [
    [/^(road|bridge|tunnel)_(link|secondary_tertiary|trunk_primary)$/, "line-color", "#ffffff"],
    [/^(road|bridge|tunnel)_(link|secondary_tertiary|trunk_primary)_casing$/, "line-color", "#d9d4cc"],
    [/^(road|bridge|tunnel)_motorway(_link)?$/, "line-color", "#fbe4a6"],
    [/^(road|bridge|tunnel)_motorway(_link)?_casing$/, "line-color", "#e2c47f"],
    [/^water$/, "fill-color", "#a9d3f2"],
    // Shop, café, and bus stop icons crowd the court pins at street level,
    // and the pins are the only places this app cares about. The style's own
    // 3D buildings are replaced by a softer version where we want them.
    [/^(poi_.+|building-3d)$/, "visibility", "none"],
  ],
  buildingColor: "#ece8e2",
};

export const DARK_MAP = {
  styleUrl: "https://tiles.openfreemap.org/styles/dark",
  overrides: [
    [/^background$/, "background-color", "#1c1c1e"],
    [/^(landuse_residential|road_area_pier)$/, "fill-color", "#1f1f21"],
    [/^water$/, "fill-color", "#15263b"],
    [/^waterway$/, "line-color", "#15263b"],
    [/^(landuse_park|landcover_wood)$/, "fill-color", "#1b2a20"],
    [/^building$/, "fill-color", "#29292c"],
    [/^(highway_minor|highway_path|road_pier)$/, "line-color", "#323235"],
    [/^highway_(major|motorway)_casing$/, "line-color", "#1c1c1e"],
    [/^highway_major_(inner|subtle)$/, "line-color", "#414145"],
    [/^highway_motorway_(inner|subtle)$/, "line-color", "#5b5448"],
    [/^place_/, "text-color", "#a1a1a6"],
    [/^highway_name_/, "text-color", "#8e8e93"],
    [/^water_name$/, "text-color", "#6d8db3"],
  ],
  buildingColor: "#2e2e31",
};

// Colors are "paint" properties in MapLibre, while showing or hiding a layer
// ("visibility") is a "layout" property, so each goes through its own setter.
export function applyOverrides(gl, overrides) {
  for (const { id } of gl.getStyle().layers) {
    for (const [pattern, property, value] of overrides) {
      if (!pattern.test(id)) continue;
      if (property === "visibility") gl.setLayoutProperty(id, property, value);
      else gl.setPaintProperty(id, property, value);
    }
  }
}

// Extruded buildings for the 3D flyover. Inserted under the first label
// layer so street and place names stay on top.
export function addBuildings(gl, color) {
  if (gl.getLayer("buildings-3d")) return;
  const firstLabel = gl.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
  gl.addLayer(
    {
      id: "buildings-3d",
      type: "fill-extrusion",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": color,
        // Grow the buildings out of the ground as you zoom in.
        "fill-extrusion-height": [
          "interpolate", ["linear"], ["zoom"],
          13, 0,
          14.5, ["coalesce", ["get", "render_height"], 0],
        ],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.9,
      },
    },
    firstLabel,
  );
}
