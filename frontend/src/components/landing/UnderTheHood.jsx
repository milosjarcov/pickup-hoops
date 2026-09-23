import { useRef } from "react";
import { useInView } from "../../hooks/useInView";
import { GITHUB_URL } from "../../lib/links";
import { ChevronRightIcon } from "../Icons";

// Copied from backend/app/routers/runs.py. If that function changes, update
// this too, so the page never shows code the app doesn't actually run.
const JOIN_RUN = `@router.post("/{run_id}/join", response_model=RunOut)
def join_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = get_run_or_404(run_id, db)
    if current_user in run.players:
        raise HTTPException(status_code=409, detail="Already joined this run")
    if len(run.players) >= run.max_players:
        raise HTTPException(status_code=409, detail="Run is full")
    run.players.append(current_user)
    db.commit()
    db.refresh(run)
    return run`;

const ROUTES = [
  ["GET", "/courts", "Every court"],
  ["GET", "/runs", "Upcoming runs, or one court's"],
  ["POST", "/runs", "Post a run"],
  ["POST", "/runs/{id}/join", "Join a run"],
  ["POST", "/runs/{id}/leave", "Leave a run"],
  ["DELETE", "/runs/{id}", "Cancel a run you host"],
  ["POST", "/auth/register", "Create an account"],
  ["POST", "/auth/login", "Sign in, get a token"],
  ["POST", "/auth/guest", "Try it without an account"],
  ["GET", "/auth/me", "Who's signed in"],
];

const LAYERS = [
  {
    name: "React",
    tech: "Vite, React Router, Leaflet, MapLibre GL",
    role: "Runs in the browser. Draws the map, keeps you signed in, and talks to the API.",
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
        <path d="M3 9h18M6.5 6.75h.01M9 6.75h.01" />
      </>
    ),
  },
  {
    name: "FastAPI",
    tech: "Python, Pydantic, PyJWT, bcrypt",
    role: "Checks every request, hashes passwords, and signs the tokens that prove who you are.",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="6.5" rx="2" />
        <rect x="4" y="13.5" width="16" height="6.5" rx="2" />
        <path d="M8 7.25h.01M8 16.75h.01" />
      </>
    ),
  },
  {
    name: "PostgreSQL",
    tech: "SQLAlchemy 2.0, SQLite for local work",
    role: "Four tables: users, courts, runs, and the players in each run.",
    icon: (
      <>
        <ellipse cx="12" cy="6" rx="7.5" ry="2.75" />
        <path d="M4.5 6v12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75V6M4.5 12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75" />
      </>
    ),
  },
];
const LINKS = ["JSON over HTTPS", "SQLAlchemy ORM"];

// A tiny Python highlighter: enough for one function, colored like Xcode's
// dark theme. Each alternative in the regex is one kind of token.
const PYTHON_TOKENS =
  /(#[^\n]*)|("(?:[^"\\\n]|\\.)*")|(@[\w.]+)|\b(def|return|raise|if|in|not|is|None|True|False)\b|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;
const TOKEN_CLASSES = ["comment", "string", "decorator", "keyword", "number", "call"];

function highlight(code) {
  const parts = [];
  let last = 0;
  for (const match of code.matchAll(PYTHON_TOKENS)) {
    if (match.index > last) parts.push(code.slice(last, match.index));
    const kind = TOKEN_CLASSES[match.slice(1).findIndex((group) => group !== undefined)];
    parts.push(
      <span key={match.index} className={`tok-${kind}`}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  parts.push(code.slice(last));
  return parts;
}

// The section for engineers: what the stack is, how the pieces talk, every
// API route, and a real function from the back end.
export default function UnderTheHood() {
  const archRef = useRef(null);
  const archVisible = useInView(archRef, { threshold: 0.4 });

  return (
    <section className="hood" id="under-the-hood" aria-labelledby="hood-title">
      <div className="hood-inner">
        <p className="hood-eyebrow" data-reveal>
          Under the hood
        </p>
        <h2 id="hood-title" data-reveal>
          A real stack, end to end.
        </h2>
        <p className="hood-lead" data-reveal>
          Pickup Hoops is a full-stack web app. A React front end talks to a FastAPI back end over a small JSON
          API, and every court, run, and player lives in PostgreSQL.
        </p>

        <div ref={archRef} className={archVisible ? "arch is-visible" : "arch"}>
          {LAYERS.map((layer, i) => (
            <div className="arch-step" key={layer.name}>
              <div className="arch-node" style={{ "--i": i }}>
                <svg
                  className="arch-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {layer.icon}
                </svg>
                <h3>{layer.name}</h3>
                <p className="arch-tech">{layer.tech}</p>
                <p className="arch-role">{layer.role}</p>
              </div>
              {LINKS[i] && (
                <div className="arch-link" style={{ "--i": i }}>
                  <span>{LINKS[i]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hood-grid">
          <div className="routes" data-reveal>
            <h3>The API</h3>
            <p className="hood-note">Ten routes. Anyone can read courts and runs; posting, joining, and leaving need a token.</p>
            <ul>
              {ROUTES.map(([method, path, what]) => (
                <li key={method + path} className="route">
                  <span className={`route-method is-${method.toLowerCase()}`}>{method}</span>
                  <code className="route-path">{path}</code>
                  <span className="route-what">{what}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="code" data-reveal>
            <figcaption>
              <h3>Joining a run</h3>
              <p className="hood-note">
                FastAPI injects the database session and the signed-in user. The function only has to check the
                rules: no joining twice, no joining a full run.
              </p>
            </figcaption>
            <pre>
              <code>{highlight(JOIN_RUN)}</code>
            </pre>
          </figure>
        </div>

        <a className="hood-source link-chevron" href={GITHUB_URL} data-reveal>
          Read the source on GitHub
          <ChevronRightIcon />
        </a>
      </div>
    </section>
  );
}
