// The one loading indicator used everywhere: in buttons, lists, and full page.
export default function Spinner({ label = "Loading", className = "" }) {
  return <span className={`spinner ${className}`} role="status" aria-label={label} />;
}
