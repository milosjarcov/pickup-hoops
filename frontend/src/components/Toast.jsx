import { useEffect } from "react";
import { CheckIcon } from "./Icons";

// A short confirmation that floats in and fades away, like the "Added"
// banners in Apple's apps. `toast` is { id, message } or null. The id makes
// React treat each toast as new, so the animation replays every time.
export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div key={toast.id} className="toast" role="status">
      <CheckIcon />
      {toast.message}
    </div>
  );
}
