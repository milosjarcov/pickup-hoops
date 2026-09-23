// Stroke icons drawn in the spirit of SF Symbols. They size with font-size
// (1em) and color with currentColor, so they match whatever text they sit in.
function Icon({ children, strokeWidth = 2, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </Icon>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="m15 5-7 7 7 7" />
    </Icon>
  );
}

export function PlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function MinusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}

// A filled circle with an X, like the clear button in an iOS search field.
export function ClearIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m8.5 8.5 7 7m0-7-7 7" stroke="var(--clear-x, #fff)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DirectionsIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 2.8 21.2 12 12 21.2 2.8 12z" />
      <path d="M9.5 14.5v-2a1.5 1.5 0 0 1 1.5-1.5h4.5m-2-2 2 2-2 2" />
    </Icon>
  );
}

export function BallIcon(props) {
  return (
    <Icon strokeWidth={1.7} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M6.3 5c3.2 3.5 3.2 10.5 0 14M17.7 5c-3.2 3.5-3.2 10.5 0 14" />
    </Icon>
  );
}
