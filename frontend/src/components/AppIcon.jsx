import { useId } from "react";

// The app icon: a ball arcing through a hoop on a blue rounded square. Same
// drawing as public/favicon.svg. Each copy needs its own gradient ids, or
// two icons on one page would fight over the same definitions.
export default function AppIcon({ size = 64, className }) {
  const id = useId().replace(/[^\w-]/g, "");
  const bg = `${id}-bg`;
  const ball = `${id}-ball`;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7bff" />
          <stop offset="1" stopColor="#0a3fd1" />
        </linearGradient>
        {/* Light from the top left, so the ball reads as round. */}
        <radialGradient id={ball} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffb54d" />
          <stop offset="1" stopColor="#e65300" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14.5" fill={`url(#${bg})`} />
      {/* The ball's path to the rim, drawn as a dotted arc. */}
      <path
        d="M27 14.5Q39 10 39.5 33"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.1 4"
        opacity="0.75"
      />
      <circle cx="19.5" cy="18.5" r="8.5" fill={`url(#${ball})`} />
      <g fill="none" stroke="#5a2000" strokeOpacity="0.5" strokeWidth="1.3" strokeLinecap="round">
        <path d="M11 18.5h17M19.5 10v17M14.2 12c2.3 2.6 2.3 10.4 0 13M24.8 12c-2.3 2.6-2.3 10.4 0 13" />
      </g>
      {/* Rim and net. */}
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="39.5" cy="38" rx="13" ry="3.4" />
        <path d="M27 39l4.5 14h16l4.5-14M33 41.2l2 11.8M39.5 41.4v11.6M46 41.2l-2 11.8" />
      </g>
    </svg>
  );
}
