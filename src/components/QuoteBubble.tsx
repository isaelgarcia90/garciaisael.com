import { useEffect, useRef, useState } from "react";
import { MdArrowOutward, MdAutoAwesome } from "react-icons/md";
import { openQuoteForm } from "./utils/quoteForm";
import "./styles/QuoteBubble.css";

const FIRST_DELAY_MS = 1500; // pause before the first appearance
const SHOW_MS = 5000; // time on screen each time
const GAP_MS = 5000; // time hidden between appearances
const TIMES = 3; // appearances per round
const INTRO_FALLBACK_MS = 6000; // start even if the lights-on intro never signals

// Quote tab docked at the bottom-right edge. After the page intro, its message slides out to the
// left, stays 5 s, slides back in, and repeats every 5 s up to 3 times, on a timer only (scrolling
// or clicking around doesn't pause it). Each time the visitor leaves the hero and comes back to the
// top, a new round of 3 starts if the previous one has finished.
const QuoteBubble = () => {
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const state = useRef({ introReady: false, running: false });

  useEffect(() => {
    const s = state.current;

    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

    const runRound = () => {
      if (s.running) return;
      s.running = true;
      clearTimers();
      let shown = 0;
      const show = () => {
        setVisible(true);
        shown += 1;
        later(() => {
          setVisible(false);
          if (shown < TIMES) later(show, GAP_MS);
          else s.running = false;
        }, SHOW_MS);
      };
      later(show, FIRST_DELAY_MS);
    };

    // 1. First round after the page intro (body.intro-done), with a time fallback
    const onIntro = () => {
      if (s.introReady) return;
      s.introReady = true;
      runRound();
    };
    const mo = new MutationObserver(() => {
      if (document.body.classList.contains("intro-done")) onIntro();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    if (document.body.classList.contains("intro-done")) onIntro();
    const fallback = setTimeout(onIntro, INTRO_FALLBACK_MS);

    // 2. New round each time the visitor comes back to the top (the hero) after leaving it
    const hero = document.getElementById("landingDiv");
    let leftHero = false;
    const io = hero
      ? new IntersectionObserver(
          ([entry]) => {
            const inHero = entry.intersectionRatio >= 0.5;
            if (!inHero) leftHero = true;
            else if (leftHero && s.introReady) {
              leftHero = false;
              runRound();
            }
          },
          { threshold: [0, 0.5, 1] }
        )
      : null;
    if (hero && io) io.observe(hero);

    return () => {
      mo.disconnect();
      io?.disconnect();
      clearTimeout(fallback);
      clearTimers();
    };
  }, []);

  const stopRound = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    state.current.running = false;
    setVisible(false); // a new round starts the next time the visitor comes back to the top
  };

  const open = () => {
    stopRound();
    openQuoteForm("bubble");
  };

  // A small tab always docked at the bottom-right edge; the message slides out of it and back in
  return (
    <div className={`quote-dock ${visible ? "is-open" : ""}`}>
      <button
        className="quote-dock-message"
        onClick={open}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        data-cursor="disable"
      >
        Get a quote for your AI project <MdArrowOutward />
      </button>
      <button
        className="quote-dock-tab"
        onClick={open}
        aria-label="Get a quote for your AI project"
        title="Get a quote for your AI project"
        data-cursor="disable"
      >
        <MdAutoAwesome />
      </button>
    </div>
  );
};

export default QuoteBubble;
