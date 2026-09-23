import { lazy, Suspense, useEffect, useRef, useState } from "react";
import AppIcon from "../AppIcon";
import CourtList from "../CourtList";
import CourtPanel from "../CourtPanel";
import { RunFormContent } from "../RunForm";
import Spinner from "../Spinner";
import { MAP_CREDITS } from "../../lib/mapStyles";

// MapLibre is big, so the map loads on its own after the page text is up.
const ShowcaseMap = lazy(() => import("./ShowcaseMap"));

const PHONE_QUERY = "(max-width: 700px)";
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const noop = () => {};
const asyncNoop = async () => {};

function steps(courtCount) {
  const count = NUMBER_WORDS[courtCount] ?? String(courtCount);
  return [
    {
      title: "Every court. One map.",
      body: courtCount
        ? `${count} courts across Montreal, from NDG to Jarry Park.`
        : "Courts across Montreal, from NDG to Jarry Park.",
    },
    {
      title: "Know where the games are.",
      body: "Every court shows its next run, so you can tell where people are playing tonight.",
    },
    {
      title: "See who's playing.",
      body: "Skill level, open spots, and the full roster, before you leave the house.",
    },
    {
      title: "Start a run in seconds.",
      body: "Pick a time, a level, and a player cap. It's on the map for everyone right away.",
    },
  ];
}

const clamp = (value) => Math.min(1, Math.max(0, value));

// A copy of the app's sidebar, holding real app components. It sits inside
// an `inert` container, which makes it look-only: no clicks, no focus.
function Surface({ children }) {
  return (
    <div className="story-surface">
      <header className="sidebar-header">
        <div className="brand">
          <AppIcon size={28} />
          <span>Pickup Hoops</span>
        </div>
        <span className="btn-text sidebar-sign-in">Sign In</span>
      </header>
      {children}
    </div>
  );
}

// The scroll-driven tour. The section is several screens tall, and inside it
// a map "window" stays pinned to the screen while you scroll. How far you've
// scrolled picks the step, and each step changes the caption, the app panel
// shown over the map, and where the camera is.
export default function Story({ courts, runsByCourt, featured }) {
  const sectionRef = useRef(null);
  const windowRef = useRef(null);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);
  const [size, setSize] = useState({ width: 1200, height: 700, phone: false });
  const content = steps(courts?.length ?? 0);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 0 -> 1 as the section rises from the bottom of the screen to the top.
      // The CSS uses it to grow the window to full size.
      section.style.setProperty("--enter", clamp(1 - rect.top / viewport).toFixed(3));
      // 0 -> 1 across the part where the window is pinned.
      const progress = clamp(-rect.top / (rect.height - viewport));
      setStep(Math.min(content.length - 1, Math.floor(progress * content.length)));
      setRunning(rect.top < viewport && rect.bottom > 0 && !document.hidden);
      const box = windowRef.current.getBoundingClientRect();
      setSize((old) => {
        const next = {
          width: Math.round(box.width),
          height: Math.round(box.height),
          phone: window.matchMedia(PHONE_QUERY).matches,
        };
        return old.width === next.width && old.height === next.height && old.phone === next.phone ? old : next;
      });
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [content.length]);

  // Which parts of the window the caption and panel cover, so the camera
  // keeps the interesting bit in the open. Mirrors the layout in landing.css.
  // In the first step nothing covers the map, but the courts are pushed up a
  // little anyway: before you scroll, only the top of the window is on screen.
  const panelShown = step > 0;
  const padding = size.phone
    ? { top: 130, left: 0, right: 0, bottom: Math.round(size.height * (panelShown ? 0.56 : 0.2)) }
    : { top: 150, left: panelShown ? 400 : 0, right: 0, bottom: panelShown ? 0 : Math.round(size.height * 0.24) };

  const panelClass = (shownAt, dimmedAt) =>
    ["story-panel", shownAt.includes(step) && "is-active", step === dimmedAt && "is-dimmed"].filter(Boolean).join(" ");

  return (
    <section
      ref={sectionRef}
      className="story"
      id="how-it-works"
      data-step={step}
      style={{ "--steps": content.length }}
      aria-label="How Pickup Hoops works"
    >
      <div className="story-stage">
        <div ref={windowRef} className="story-window">
          <Suspense fallback={null}>
            <ShowcaseMap
              courts={courts}
              focusCourt={step >= 2 ? featured : null}
              padding={padding}
              running={running}
            />
          </Suspense>
          <div className="story-scrim" aria-hidden="true" />

          <div className="story-captions">
            {content.map((item, i) => (
              <div key={item.title} className={i === step ? "story-caption is-active" : "story-caption"} aria-hidden={i !== step}>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            ))}
          </div>

          <div className="story-panels" inert>
            <div className={panelClass([1])}>
              <Surface>
                <CourtList
                  courts={courts}
                  runsByCourt={runsByCourt}
                  query=""
                  onQueryChange={noop}
                  onSelect={noop}
                  onRetry={noop}
                />
              </Surface>
            </div>
            <div className={panelClass([2, 3], 3)}>
              <Surface>
                {featured ? (
                  <CourtPanel
                    court={featured}
                    runs={runsByCourt.get(featured.id) ?? []}
                    onBack={noop}
                    onRunsChanged={asyncNoop}
                  />
                ) : (
                  <div className="state">
                    <Spinner />
                  </div>
                )}
              </Surface>
            </div>
            <div className={panelClass([3])}>
              <div className="story-sheet">
                {featured && (
                  <RunFormContent court={featured} titleId="story-new-run" onCreated={asyncNoop} onCancel={noop} />
                )}
              </div>
            </div>
          </div>

          <p className="story-credit" dangerouslySetInnerHTML={{ __html: MAP_CREDITS }} />
        </div>
      </div>
    </section>
  );
}
