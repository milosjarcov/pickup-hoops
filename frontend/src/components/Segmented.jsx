// iOS-style segmented control. Under the hood it's a group of real radio
// buttons, so arrow keys and screen readers work for free. The white "thumb"
// slides to the selected option through the --index CSS variable.
export default function Segmented({ name, label, options, value, onChange }) {
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={label}
      style={{ "--count": options.length, "--index": index }}
    >
      <span className="segmented-thumb" aria-hidden="true" />
      {options.map((option) => (
        <label key={option.value} className="segmented-option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
