import { initials } from "../lib/format";

// A monogram circle, like a contact without a photo in Apple's Contacts app.
export function Avatar({ name, size = 28 }) {
  return (
    <span className="avatar" style={{ "--size": `${size}px` }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

// Overlapping avatars for a run's roster. After `max` people the rest
// collapse into a "+3" bubble so the row never wraps.
export function AvatarStack({ people, max = 3, size = 22 }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="avatar-stack" aria-hidden="true">
      {shown.map((person) => (
        <Avatar key={person.id} name={person.name} size={size} />
      ))}
      {extra > 0 && (
        <span className="avatar avatar-more" style={{ "--size": `${size}px` }}>
          +{extra}
        </span>
      )}
    </span>
  );
}
