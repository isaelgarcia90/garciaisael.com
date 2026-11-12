declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Send a custom event to Google Analytics (no-op if the tag is blocked or missing)
export function trackEvent(name: string, params: Record<string, string> = {}) {
  window.gtag?.("event", name, params);
}

// Sections reported as "section_view", once per visit each
const SECTIONS: Record<string, string> = {
  ".landing-section": "landing",
  ".about-section": "about",
  ".whatIDO": "what_i_do",
  ".career-section": "career",
  ".work-section": "work",
  ".techstack": "tech_stack",
  ".contact-section": "contact",
};

export function trackSectionViews(): () => void {
  const seen = new Set<string>();
  const watched = new Set<Element>();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = (entry.target as HTMLElement).dataset.trackSection;
        if (section && !seen.has(section)) {
          seen.add(section);
          trackEvent("section_view", { section });
        }
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  // Sections can mount later (TechStack is lazy, mobile/desktop switch), so keep scanning
  const scan = () => {
    Object.entries(SECTIONS).forEach(([selector, name]) => {
      if (seen.has(name)) return;
      const el = document.querySelector<HTMLElement>(selector);
      if (el && !watched.has(el)) {
        watched.add(el);
        el.dataset.trackSection = name;
        io.observe(el);
      }
    });
  };

  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
  };
}

// Ping /api/visit once per browser session so a Discord notification is sent
export function notifyVisit() {
  if (!["garciaisael.com", "www.garciaisael.com"].includes(location.hostname)) return;
  try {
    if (sessionStorage.getItem("visit-notified")) return;
    sessionStorage.setItem("visit-notified", "1");
  } catch {
    // storage blocked: still notify
  }
  fetch("/api/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referrer: document.referrer }),
    keepalive: true,
  }).catch(() => undefined);
}
