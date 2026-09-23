import { useEffect, useRef } from "react";

// A modal built on the native <dialog> element. showModal() gives us a lot
// for free: it renders above the map (the "top layer", so no z-index fights
// with Leaflet), traps keyboard focus inside, and closes on Escape.
//
// The parent decides whether the sheet exists: render it to open it, stop
// rendering it (via onClose) to close it.
export default function Sheet({ className = "", labelledBy, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className={`sheet ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        // Escape key: let React state close it instead of the browser, so
        // the two never disagree about whether the sheet is open.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicks on the dimmed backdrop land on the <dialog> itself.
        // Clicks on the content land on its children.
        if (e.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
