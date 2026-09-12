// Inline SVG basketball — the 🏀 emoji renders inconsistently across platforms.
const SEAMS = (
  <g stroke="#1a1207" strokeWidth="1.5" fill="none">
    <path d="M12 1.5v21" />
    <path d="M1.5 12h21" />
    <path d="M5.2 4.2c4.2 4.2 4.2 11.4 0 15.6" />
    <path d="M18.8 4.2c-4.2 4.2-4.2 11.4 0 15.6" />
  </g>
);

export const BALL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="70%" height="70%"><circle cx="12" cy="12" r="10.5" fill="#f97316"/><g stroke="#1a1207" stroke-width="1.5" fill="none"><path d="M12 1.5v21"/><path d="M1.5 12h21"/><path d="M5.2 4.2c4.2 4.2 4.2 11.4 0 15.6"/><path d="M18.8 4.2c-4.2 4.2-4.2 11.4 0 15.6"/></g></svg>`;

export default function Ball() {
  return (
    <svg viewBox="0 0 24 24" width="70%" height="70%">
      <circle cx="12" cy="12" r="10.5" fill="#f97316" />
      {SEAMS}
    </svg>
  );
}
