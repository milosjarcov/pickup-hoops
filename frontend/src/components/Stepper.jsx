import { MinusIcon, PlusIcon } from "./Icons";

// A minus/plus pair like UIStepper on iOS. Clamping to min and max here means
// the form can never submit a value the API would reject.
export default function Stepper({ label, value, min, max, onChange }) {
  return (
    <div className="stepper-wrap">
      <output className="stepper-value" aria-live="polite">
        {value}
      </output>
      <div className="stepper" role="group" aria-label={label}>
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <MinusIcon />
        </button>
        <span className="stepper-divider" aria-hidden="true" />
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
