import { useEffect, useState } from "react";

// True once the element has scrolled into view, and it stays true.
// For "animate when you first see it" effects.
export function useInView(ref, { threshold = 0.3 } = {}) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold, seen]);
  return seen;
}

// Adds "is-visible" to every [data-reveal] element inside `rootRef` as it
// scrolls into view. The CSS turns that into a fade and rise.
export function useReveal(rootRef) {
  useEffect(() => {
    const elements = rootRef.current.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}
