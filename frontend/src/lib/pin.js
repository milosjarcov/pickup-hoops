// Court pins are plain HTML so CSS can style and animate them. Both maps
// (Leaflet in the app, MapLibre on the landing page) use this same markup.
const BALL_SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M6.3 5c3.2 3.5 3.2 10.5 0 14M17.7 5c-3.2 3.5-3.2 10.5 0 14"/></svg>';

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// `delay` staggers the drop-in animation so pins land one after another.
export function pinHtml(name, delay = 0) {
  const style = `style="--delay:${delay}ms"`;
  return `<span class="pin-dot" ${style}>${BALL_SVG}</span><span class="pin-label" ${style}>${escapeHtml(name)}</span>`;
}
