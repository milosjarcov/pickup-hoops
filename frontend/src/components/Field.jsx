// Text input with the label inside the box, like Apple's sign-in forms.
// The label shrinks up out of the way once the field is focused or filled.
// CSS can only tell "filled" apart from "empty" through :placeholder-shown,
// which is why every field gets a blank placeholder.
export default function Field({ label, ...inputProps }) {
  return (
    <label className="field">
      <input placeholder=" " {...inputProps} />
      <span className="field-label">{label}</span>
    </label>
  );
}
