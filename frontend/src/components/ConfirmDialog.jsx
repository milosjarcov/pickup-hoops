import { useId } from "react";
import Sheet from "./Sheet";

// Small centered alert with two side-by-side buttons, like an iOS alert.
// Used before anything that can't be undone.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  return (
    <Sheet className="alert" labelledBy={titleId} onClose={onCancel}>
      <div className="alert-body">
        <h2 id={titleId}>{title}</h2>
        {message && <p>{message}</p>}
      </div>
      <div className="alert-actions">
        <button type="button" className="is-default" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="is-destructive" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
