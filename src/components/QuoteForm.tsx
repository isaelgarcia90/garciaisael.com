import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { MdArrowOutward, MdClose } from "react-icons/md";
import { smoother } from "./Navbar";
import { trackEvent } from "./utils/analytics";
import { OPEN_QUOTE_EVENT, openQuoteForm } from "./utils/quoteForm";
import "./styles/QuoteForm.css";

type Status = "idle" | "sending" | "sent" | "error";
type Errors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_ANSWER = 10; // shortest useful answer for the two open questions

// Required fields, checked in screen order so the first error gets the focus
function validate(d: Record<string, string>): Errors {
  const e: Errors = {};
  if (d.name.length < 2) e.name = "Please enter your name.";
  if (!d.email) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(d.email)) e.email = "Please enter a valid email, like name@company.com.";
  if (!d.goal) e.goal = "Please tell me your main goal.";
  else if (d.goal.length < MIN_ANSWER) e.goal = `Please add a bit more detail (at least ${MIN_ANSWER} characters).`;
  if (!d.results) e.results = "Please describe the results you expect.";
  else if (d.results.length < MIN_ANSWER)
    e.results = `Please add a bit more detail (at least ${MIN_ANSWER} characters).`;
  if (!d.timeline) e.timeline = "Please choose a timeline.";
  if (!d.data) e.data = "Please choose an option.";
  return e;
}

// Label text with a required (*) or optional mark
const Label = ({ text, required }: { text: string; required?: boolean }) => (
  <span>
    {text} {required ? <b className="quote-req" aria-hidden="true">*</b> : <em>(optional)</em>}
  </span>
);

const FieldError = ({ name, errors }: { name: string; errors: Errors }) =>
  errors[name] ? (
    <small className="quote-field-error" id={`quote-${name}-error`}>
      {errors[name]}
    </small>
  ) : null;

// The form itself, mounted once in MainContainer
export const QuoteModal = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
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

  useEffect(() => {
    const onOpen = (e: Event) => {
      setStatus((s) => (s === "sent" ? s : "idle"));
      setOpen(true);
      trackEvent("quote_open", { source: String((e as CustomEvent).detail ?? "") });
    };
    window.addEventListener(OPEN_QUOTE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_QUOTE_EVENT, onOpen);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => (data[k] = String(v).trim()));
    const found = validate(data);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name='${first}']`)?.focus();
      return;
    }
    setStatus("sending");
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
          <form
            onSubmit={onSubmit}
            noValidate
            onInput={(e) => {
              const name = (e.target as HTMLInputElement).name;
              if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
            }}
          >
            <h3 id="quote-title">Get a quote for your AI project</h3>
            <p className="quote-intro">
              Four business questions, no technical knowledge needed. I'll turn your answers into an
              architecture, a timeline and a cost estimate.
            </p>
            <p className="quote-legend">
              Fields marked <b className="quote-req">*</b> are required.
            </p>

            <div className="quote-row">
              <label>
                <Label text="Name" required />
                <input name="name" maxLength={80} autoComplete="name" aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? "quote-name-error" : undefined} />
                <FieldError name="name" errors={errors} />
              </label>
              <label>
                <Label text="Email" required />
                <input name="email" type="email" maxLength={120} autoComplete="email" aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? "quote-email-error" : undefined} />
                <FieldError name="email" errors={errors} />
              </label>
            </div>
            <label>
              <Label text="Company" />
              <input name="company" maxLength={100} autoComplete="organization" />
            </label>

            <label>
              <Label text="1. What is the main goal you want to achieve with AI?" required />
              <textarea
                name="goal"
                aria-required="true" aria-invalid={!!errors.goal} aria-describedby={errors.goal ? "quote-goal-error" : undefined}
                maxLength={1000}
                rows={3}
                placeholder="e.g. Our technicians waste hours searching through equipment manuals."
              />
              <FieldError name="goal" errors={errors} />
            </label>
            <label>
              <Label text="2. What concrete results do you expect to see day to day?" required />
              <textarea
                name="results"
                aria-required="true" aria-invalid={!!errors.results} aria-describedby={errors.results ? "quote-results-error" : undefined}
                maxLength={1000}
                rows={3}
                placeholder="e.g. Get the right answer, with the manual page, in seconds."
              />
              <FieldError name="results" errors={errors} />
            </label>
            <label>
              <Label text="3. What is your ideal timeline to have it running?" required />
              <select name="timeline" defaultValue="" aria-required="true" aria-invalid={!!errors.timeline} aria-describedby={errors.timeline ? "quote-timeline-error" : undefined}>
                <option value="" disabled>
                  Choose one
                </option>
                <option value="under-1-month">Less than 1 month</option>
                <option value="1-3-months">1 to 3 months</option>
                <option value="3-6-months">3 to 6 months</option>
                <option value="flexible">Flexible / not sure</option>
              </select>
              <FieldError name="timeline" errors={errors} />
            </label>
            <label>
              <Label text="4. Is your data already organized (manuals, PDFs, databases)?" required />
              <select name="data" defaultValue="" aria-required="true" aria-invalid={!!errors.data} aria-describedby={errors.data ? "quote-data-error" : undefined}>
                <option value="" disabled>
                  Choose one
                </option>
                <option value="ready">Yes, it's organized and ready</option>
                <option value="partial">Partly, it needs some cleanup</option>
                <option value="needs-help">No, we'll need help with that</option>
                <option value="unsure">Not sure</option>
              </select>
              <FieldError name="data" errors={errors} />
            </label>
            <label>
              <Label text="Anything else about your data?" />
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

  return open ? createPortal(modal, document.body) : null;
};

// "Work with me" block in the Contact section
const QuoteForm = () => (
  <div className="quote-cta">
    <h4>Work with me</h4>
    <p>Building something with AI (RAG, agents, automations)? Tell me about it and get a quote.</p>
    <button className="quote-cta-button" onClick={() => openQuoteForm("contact")} data-cursor="disable">
      Get a quote for your AI project <MdArrowOutward />
    </button>
  </div>
);

export default QuoteForm;
