import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import AppIcon from "../components/AppIcon";
import { ChevronRightIcon } from "../components/Icons";
import LiveStats from "../components/landing/LiveStats";
import Story from "../components/landing/Story";
import UnderTheHood from "../components/landing/UnderTheHood";
import { useReveal } from "../hooks/useInView";
import { GITHUB_URL, PORTFOLIO_URL } from "../lib/links";
import { busiestCourt, groupByCourt } from "../lib/runs";
import "../landing.css";

// The front door. Built like an Apple product page: one big idea up top,
// the product demoing itself as you scroll, then the details. Everything on
// it is live: the courts, the runs, and the numbers come from the API.
export default function Landing() {
  const rootRef = useRef(null);
  const [courts, setCourts] = useState(null);
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    // If the API is asleep or down, the page still works; it just shows
    // fewer live details.
    Promise.all([api("/courts"), api("/runs")])
      .then(([courtList, runList]) => {
        setCourts(courtList);
        setRuns(runList);
      })
      .catch(() => {});
  }, []);

  useReveal(rootRef);

  // The nav goes dark while it's over the dark "Under the hood" section, the
  // way apple.com's does, instead of a light blur smeared over black.
  const [navDark, setNavDark] = useState(false);
  useEffect(() => {
    const hood = document.getElementById("under-the-hood");
    function update() {
      const { top, bottom } = hood.getBoundingClientRect();
      setNavDark(top <= 26 && bottom > 26);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const runsByCourt = useMemo(() => groupByCourt(runs), [runs]);
  const featured = useMemo(() => busiestCourt(courts, runsByCourt), [courts, runsByCourt]);

  return (
    <div className="landing" ref={rootRef}>
      <header className={navDark ? "landing-nav is-dark" : "landing-nav"}>
        <div className="landing-nav-inner">
          <Link to="/" className="brand">
            <AppIcon size={26} />
            <span>Pickup Hoops</span>
          </Link>
          <nav aria-label="Page">
            <a href="#how-it-works" className="nav-link">
              How It Works
            </a>
            <a href="#under-the-hood" className="nav-link">
              Under the Hood
            </a>
            <a href={GITHUB_URL} className="nav-link">
              GitHub
            </a>
            <Link to="/map" className="btn btn-primary btn-small">
              Open Map
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <p className="hero-eyebrow">Pickup Hoops</p>
          <h1 className="hero-title">Find your next run.</h1>
          <p className="hero-sub">
            Pickup basketball at courts across Montreal. See who's playing tonight, join a game in one tap, or
            start your own.
          </p>
          <div className="hero-actions">
            <Link to="/map" className="btn btn-primary btn-large">
              Open the Map
            </Link>
            <a href={GITHUB_URL} className="link-chevron hero-link">
              View the code
              <ChevronRightIcon />
            </a>
          </div>
          <p className="hero-note">No account needed to look around.</p>
        </section>

        <Story courts={courts} runsByCourt={runsByCourt} featured={featured} />

        <LiveStats courts={courts} runs={runs} />

        <UnderTheHood />

        <section className="closing">
          <h2 data-reveal>See you on the court.</h2>
          <p data-reveal>Browse every court and run in Montreal. Sign in only when you're ready to play.</p>
          <div data-reveal>
            <Link to="/map" className="btn btn-primary btn-large">
              Open the Map
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <p>Designed and built by Milos Jarcov in Montreal.</p>
          <nav aria-label="Elsewhere">
            <a href={PORTFOLIO_URL}>Portfolio</a>
            <a href={GITHUB_URL}>Source Code</a>
          </nav>
          <p className="landing-credits">
            Map data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, tiles by{" "}
            <a href="https://openfreemap.org">OpenFreeMap</a> and <a href="https://www.openmaptiles.org/">OpenMapTiles</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
