// Inline SVG so the marks inherit currentColor and need no extra requests.

export function BallMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="8.2" />
      <path d="M10 1.8v16.4M1.8 10h16.4" />
      <path d="M3.6 4.1c3.4 2.2 4.9 7 3.6 11.7M16.4 4.1c-3.4 2.2-4.9 7-3.6 11.7" />
    </svg>
  );
}

/** Half-court arc, used as the empty-state illustration. */
export function CourtArc() {
  return (
    <svg width="64" height="38" viewBox="0 0 56 34" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 33h54M10 33a18 18 0 0 1 36 0M28 33V19" />
      <circle cx="28" cy="14" r="5" />
    </svg>
  );
}

export function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7.5 2 3.5 6l4 4" />
    </svg>
  );
}

export function Close() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
    </svg>
  );
}
