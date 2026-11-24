import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { MdArrowOutward, MdClose } from "react-icons/md";
import { smoother } from "./Navbar";
import { trackEvent } from "./utils/analytics";
import "./styles/QuoteForm.css";

type Status = "idle" | "sending" | "sent" | "error";

const QuoteForm = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Freeze the page scroll while the form is open, and close it with Escape
  useEffect(() => {
    if (!open) return;
    const wasPaused = smoother?.paused() ?? false;
    smoother?.paused(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // ScrollSmoother blocks wheel/touch scrolling while paused: keep those events inside the form
    const dialog = dialogRef.current;
    const keepInside = (e: Event) => e.stopPropagation();
    dialog?.addEventListener("wheel", keepInside);
    dialog?.addEventListener("touchmove", keepInside);
    dialog?.querySelector<HTMLInputElement>("input[name='name']")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      dialog?.removeEventListener("wheel", keepInside);
      dialog?.removeEventListener("touchmove", keepInside);
      if (!wasPaused) smoother?.paused(false);
    };
  }, [open]);

  const openForm = () => {
    if (status !== "sent") setStatus("idle");
    setOpen(true);
    trackEvent("quote_open");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      trackEvent("quote_submit", {
        timeline: String(data.timeline ?? ""),
        data: String(data.data ?? ""),
      });
    } catch {
      setStatus("error");
    }
  };

  const modal = (
    <div className="quote-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div
        className="quote-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        ref={dialogRef}
      >
        <button className="quote-close" onClick={() => setOpen(false)} aria-label="Close" data-cursor="disable">
          <MdClose />
        </button>

        {status === "sent" ? (
          <div className="quote-done">
            <h3 id="quote-title">Thanks, I got it.</h3>
            <p>I'll review your answers and reply by email within 2 business days with next steps.</p>
            <button className="quote-submit" onClick={() => setOpen(false)} data-cursor="disable">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h3 id="quote-title">Get a quote for your AI project</h3>
            <p className="quote-intro">
              Four business questions, no technical knowledge needed. I'll turn your answers into an
              architecture, a timeline and a cost estimate.
            </p>

            <div className="quote-row">
              <label>
                <span>Name</span>
                <input name="name" required maxLength={80} autoComplete="name" />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" required maxLength={120} autoComplete="email" />
              </label>
            </div>
            <label>
              <span>
                Company <em>(optional)</em>
              </span>
              <input name="company" maxLength={100} autoComplete="organization" />
            </label>

            <label>
              <span>1. What is the main goal you want to achieve with AI?</span>
              <textarea
                name="goal"
                required
                maxLength={1000}
                rows={3}
                placeholder="e.g. Our technicians waste hours searching through equipment manuals."
              />
            </label>
            <label>
              <span>2. What concrete results do you expect to see day to day?</span>
              <textarea
                name="results"
                required
                maxLength={1000}
                rows={3}
                placeholder="e.g. Get the right answer, with the manual page, in seconds."
              />
            </label>
            <label>
              <span>3. What is your ideal timeline to have it running?</span>
              <select name="timeline" required defaultValue="">
                <option value="" disabled>
                  Choose one
                </option>
                <option value="under-1-month">Less than 1 month</option>
                <option value="1-3-months">1 to 3 months</option>
                <option value="3-6-months">3 to 6 months</option>
                <option value="flexible">Flexible / not sure</option>
              </select>
            </label>
            <label>
              <span>4. Is your data already organized (manuals, PDFs, databases)?</span>
              <select name="data" required defaultValue="">
                <option value="" disabled>
                  Choose one
                </option>
                <option value="ready">Yes, it's organized and ready</option>
                <option value="partial">Partly, it needs some cleanup</option>
                <option value="needs-help">No, we'll need help with that</option>
                <option value="unsure">Not sure</option>
              </select>
            </label>
            <label>
              <span>
                Anything else about your data? <em>(optional)</em>
              </span>
              <input
                name="dataDetail"
                maxLength={500}
                placeholder="e.g. ~300 PDF manuals, some scanned, in English"
              />
            </label>

            {/* Honeypot for bots: hidden from people */}
            <input className="quote-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            {status === "error" && (
              <p className="quote-error" role="alert">
                Something went wrong sending your answers. Please try again, or message me on{" "}
                <a href="https://www.linkedin.com/in/isaelgarcia90" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                .
              </p>
            )}

            <button className="quote-submit" type="submit" disabled={status === "sending"} data-cursor="disable">
              {status === "sending" ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="quote-cta">
        <h4>Work with me</h4>
        <p>Building something with AI (RAG, agents, automations)? Tell me about it and get a quote.</p>
        <button className="quote-cta-button" onClick={openForm} data-cursor="disable">
          Get a quote for your AI project <MdArrowOutward />
        </button>
      </div>
      {open && createPortal(modal, document.body)}
    </>
  );
};

export default QuoteForm;
