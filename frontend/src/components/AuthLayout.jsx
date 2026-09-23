import { Link } from "react-router-dom";
import AppIcon from "./AppIcon";

// Shared frame for the sign-in and create-account pages: app icon (which
// leads back home), headline, one line of context, the form, and a link to
// the other page.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="auth">
      <div className="auth-inner">
        <Link to="/" className="auth-icon-link" aria-label="Pickup Hoops home">
          <AppIcon size={72} className="auth-icon" />
        </Link>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </main>
  );
}
