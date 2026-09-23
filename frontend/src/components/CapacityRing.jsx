// How full a run is, drawn as a ring in the style of Apple's activity rings.
// Green while there's room, orange for the last couple of spots, red when full.
// The ring fills from empty when it first appears (see .ring-fill in CSS).
export default function CapacityRing({ count, max, size = 40 }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(1, count / max);
  const spotsLeft = max - count;
  const tone = spotsLeft <= 0 ? "full" : spotsLeft <= 2 ? "almost" : "open";

  return (
    <span className={`ring is-${tone}`} style={{ "--size": `${size}px` }} aria-hidden="true">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          style={{
            "--full": circumference,
            strokeDashoffset: circumference * (1 - fraction),
          }}
        />
      </svg>
      <span className="ring-count">{count}</span>
    </span>
  );
}
