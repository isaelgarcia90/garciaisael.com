import { useEffect, useState } from "react";
import { MdArrowOutward, MdClose } from "react-icons/md";
import { openQuoteForm } from "./utils/quoteForm";
import "./styles/QuoteBubble.css";

const DISMISS_KEY = "quote-bubble-dismissed";

const wasDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

// Speech bubble next to the character's head on the landing screen:
// shows "typing" dots, then "Get a quote for your AI project". Hidden once the visitor scrolls down.
const QuoteBubble = () => {
  const [ready, setReady] = useState(false); // intro finished + small delay
  const [typing, setTyping] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [dismissed, setDismissed] = useState(wasDismissed);

  // Wait for the lights-on intro (body.intro-done), then a pause before "speaking"
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    const start = () => {
      t1 = setTimeout(() => setReady(true), 2200);
      t2 = setTimeout(() => setTyping(false), 3600);
    };
    if (document.body.classList.contains("intro-done")) {
      start();
      return () => (clearTimeout(t1), clearTimeout(t2));
    }
    const mo = new MutationObserver(() => {
      if (document.body.classList.contains("intro-done")) {
        mo.disconnect();
        start();
      }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => (mo.disconnect(), clearTimeout(t1), clearTimeout(t2));
  }, []);

  // Only on the landing screen: hide after scrolling a third of the screen
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < window.innerHeight * 0.3);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  const visible = ready && atTop;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage blocked: hide for this page view only
    }
  };

  return (
    <div className={`quote-bubble ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <button
        className="quote-bubble-main"
        onClick={() => openQuoteForm("bubble")}
        tabIndex={visible ? 0 : -1}
        data-cursor="disable"
      >
        {typing ? (
          <span className="quote-bubble-dots" aria-label="typing">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <span className="quote-bubble-text">
            Get a quote for your AI project <MdArrowOutward />
          </span>
        )}
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
