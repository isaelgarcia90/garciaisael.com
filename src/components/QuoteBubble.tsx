import { useEffect, useRef, useState } from "react";
import { MdArrowOutward, MdClose } from "react-icons/md";
import { openQuoteForm } from "./utils/quoteForm";
import "./styles/QuoteBubble.css";

const FIRST_DELAY_MS = 1500; // pause before the first appearance
const SHOW_MS = 5000; // time on screen each time
const GAP_MS = 5000; // time hidden between appearances
const TIMES = 3; // appearances per round
const INTRO_FALLBACK_MS = 6000; // start even if the lights-on intro never signals

// Floating speech bubble, bottom right. While the visitor is on the hero (landing) it slides in
// from the right, stays 5 s, slides out, and repeats every 5 s up to 3 times. After leaving the
// hero and coming back to the top, a new round of 3 starts.
const QuoteBubble = () => {
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const state = useRef({ introReady: false, inHero: true, roundStarted: false, leftHero: false });

  useEffect(() => {
    const s = state.current;

    const clearTimers = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

    const runRound = () => {
      clearTimers();
      setVisible(false);
      let shown = 0;
      const show = () => {
        setVisible(true);
        shown += 1;
        later(() => {
          setVisible(false);
          if (shown < TIMES) later(show, GAP_MS);
        }, SHOW_MS);
      };
      later(show, FIRST_DELAY_MS);
    };

    const maybeStart = () => {
      if (!s.introReady || !s.inHero) return;
      if (!s.roundStarted || s.leftHero) {
        s.roundStarted = true;
        s.leftHero = false;
        runRound();
      }
    };

    // 1. Wait for the page intro (body.intro-done), with a time fallback
    const onIntro = () => {
      if (s.introReady) return;
      s.introReady = true;
      maybeStart();
    };
    const mo = new MutationObserver(() => {
      if (document.body.classList.contains("intro-done")) onIntro();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    if (document.body.classList.contains("intro-done")) onIntro();
    const fallback = setTimeout(onIntro, INTRO_FALLBACK_MS);

    // 2. Track whether the hero is on screen (at least half of it)
    const hero = document.getElementById("landingDiv");
    const io = hero
      ? new IntersectionObserver(
          ([entry]) => {
            const inHero = entry.intersectionRatio >= 0.5;
            if (inHero === s.inHero) return;
            s.inHero = inHero;
            if (inHero) {
              maybeStart();
            } else {
              clearTimers();
              setVisible(false);
              if (s.roundStarted) s.leftHero = true;
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

  const dismiss = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setVisible(false); // no more this round; a new round starts after leaving and returning to the hero
  };

  return (
    <div className={`quote-bubble ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <button
        className="quote-bubble-main"
        onClick={() => {
          dismiss();
          openQuoteForm("bubble");
        }}
        tabIndex={visible ? 0 : -1}
        data-cursor="disable"
      >
        <span className="quote-bubble-avatar" aria-hidden="true">
          IG
        </span>
        <span className="quote-bubble-text">
          Get a quote for your AI project <MdArrowOutward />
        </span>
      </button>
      <button
        className="quote-bubble-close"
        onClick={dismiss}
        aria-label="Hide message"
        tabIndex={visible ? 0 : -1}
        data-cursor="disable"
      >
        <MdClose />
      </button>
    </div>
  );
};

export default QuoteBubble;
