import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Avatar } from "./Avatar";

// Your monogram in the corner. Clicking it opens a small menu with who you
// are signed in as and a Sign Out button.
export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when you click anywhere else or press Escape. Only listen while
  // open, so a closed menu costs nothing.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account-button"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={user.name} size={30} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-header">
            <Avatar name={user.name} size={40} />
            <div className="menu-who">
              <p className="menu-name">{user.name}</p>
              {/* A guest's address is made up, so don't show it. */}
              <p className="menu-email">{user.is_guest ? "Guest account" : user.email}</p>
            </div>
          </div>
          <div className="menu-separator" />
          {user.is_guest && (
            <Link to="/register" role="menuitem" className="menu-item">
              Create an Account
            </Link>
          )}
          <button type="button" role="menuitem" className="menu-item" onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
