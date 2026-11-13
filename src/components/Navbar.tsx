import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import ThemeSwitcher from "./ThemeSwitcher";
import { MdClose, MdMenu } from "react-icons/md";
import { TbNotes } from "react-icons/tb";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";
import { onWidthResize } from "./utils/widthResize";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

// Space between the menu bar and a section title after tapping a menu link
const TITLE_GAP = 32;

// The scroll animations move some sections while you scroll, so the title's
// final spot can't be read from the layout. Before scrolling, preview the
// scroll-linked animations at a candidate position (nothing is painted in
// between), measure the title there, and refine. Then scroll once, straight
// to the exact spot, with no correction at the end.
const findTitleScroll = (title: HTMLElement, wanted: number, guess: number, min: number) => {
  const scrubbed = ScrollTrigger.getAll().filter((t) => t.vars.scrub && t.animation);
  const saved = scrubbed.map((t) => t.animation!.progress());
  const current = smoother.scrollTop();
  const maxScroll = ScrollTrigger.maxScroll(window);
  const clampScroll = (s: number) => Math.min(maxScroll, Math.max(min, s));
  // where the title would sit on screen if the page were scrolled to s
  const titleTopAt = (s: number) => {
    scrubbed.forEach((t) => {
      const span = t.end - t.start || 1;
      t.animation!.progress(Math.min(1, Math.max(0, (s - t.start) / span)));
    });
    return title.getBoundingClientRect().top + current - s;
  };
  let s0 = clampScroll(guess);
  let f0 = titleTopAt(s0) - wanted;
  let s1 = clampScroll(s0 + f0);
  for (let i = 0; i < 6 && Math.abs(f0) > 1 && s1 !== s0; i++) {
    const f1 = titleTopAt(s1) - wanted;
    const slope = (f0 - f1) / (s1 - s0) || 1;
    s0 = s1;
    f0 = f1;
    s1 = clampScroll(s1 + f1 / Math.min(1.5, Math.max(0.2, slope)));
  }
  scrubbed.forEach((t, i) => t.animation!.progress(saved[i]));
  return Math.round(s0);
};

// Position of an element in the page, ignoring the scroll animations' transforms
const layoutTop = (el: HTMLElement) => {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
};

// Same "< IG >" logo as the cap: brackets in the color mode, white IG, soft glow
const CapLogo = () => (
  <svg viewBox="0 0 260 200" aria-hidden="true">
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M55 55 L15 100 L55 145" />
      <path d="M205 55 L245 100 L205 145" />
    </g>
    <text
      x="130"
      y="128"
      textAnchor="middle"
      fontFamily="Arial Black, Arial, sans-serif"
      fontWeight="900"
      fontSize="80"
      letterSpacing="-3"
      fill="#fff"
    >
      IG
    </text>
  </svg>
);

const goToTop = (e: React.MouseEvent) => {
  e.preventDefault();
  if (smoother) smoother.scrollTo(0, true);
  else window.scrollTo({ top: 0, behavior: "smooth" });
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Only one dropdown open at a time (section menu vs. color mode menu)
  useEffect(() => {
    if (menuOpen) window.dispatchEvent(new CustomEvent("dropdownopen", { detail: "nav" }));
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== "nav") setMenuOpen(false);
    };
    window.addEventListener("dropdownopen", onOther);
    return () => window.removeEventListener("dropdownopen", onOther);
  }, [menuOpen]);

  // Mobile menu: close on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  // Mark when the hero is off screen, so the purple corner glows can fade out
  // on phones and tablets in portrait (they tinted the sections below)
  useEffect(() => {
    const landing = document.querySelector(".landing-section");
    if (!landing) return;
    const io = new IntersectionObserver(([entry]) =>
      document.body.classList.toggle("past-landing", !entry.isIntersecting)
    );
    io.observe(landing);
    return () => io.disconnect();
  }, []);

  // Share the bar height with the CSS (--navH), so sections start right below it
  useEffect(() => {
    const header = document.querySelector(".header") as HTMLElement | null;
    if (!header) return;
    const setNavH = () =>
      document.documentElement.style.setProperty("--navH", `${header.offsetHeight}px`);
    setNavH();
    const ro = new ResizeObserver(setNavH);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        const section = element.getAttribute("data-href");
        if (!section) return;
        e.preventDefault();
        // On mobile, leave room for the fixed top bar
        const header = document.querySelector(".header") as HTMLElement | null;
        const navH = header?.offsetHeight ?? 64;
        // One column layout: leave room for the fixed top bar
        if (window.innerWidth <= 1024) {
          smoother.scrollTo(section, true, `top ${navH}px`);
          return;
        }
        // Tablets in landscape: every section title lands the same distance below the bar.
        // What I Do keeps "top top" (its cards only show once the character sits down).
        const target = document.querySelector(section) as HTMLElement | null;
        const title = target?.querySelector(".section-title") as HTMLElement | null;
        const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        if (!touch || !target || !title || section === "#whatido") {
          smoother.scrollTo(section, true, "top top");
          return;
        }
        // About Me: never stop before the character has finished moving aside
        const landing = document.querySelector(".landing-section") as HTMLElement | null;
        const min = section === "#about" ? landing?.offsetHeight ?? 0 : 0;
        const guess = layoutTop(title) - navH - TITLE_GAP;
        smoother.scrollTo(findTitleScroll(title, navH + TITLE_GAP, guess, min), true);
      });
    });
    onWidthResize(() => ScrollSmoother.refresh(true));
  }, []);
  return (
    <>
      <div className={`header ${menuOpen ? "menu-open" : ""}`}>
        <div className="header-left">
          <a
            href="/#"
            className="navbar-title"
            data-cursor="disable"
            aria-label="Back to top"
            onClick={goToTop}
          >
            <CapLogo />
          </a>
          <div className="header-stack">
            <ThemeSwitcher />
            <a
              href="/Isael_Garcia__CV.pdf"
              className="navbar-resume"
              data-cursor="disable"
              target="_blank"
              rel="noreferrer"
            >
              RESUME <TbNotes />
            </a>
          </div>
        </div>
        <div className="header-right">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <MdClose /> : <MdMenu />}
          </button>
          <ul onClick={() => setMenuOpen(false)}>
            <li>
              <a data-href="#about" href="#about">
                <HoverLinks text="About Me" />
              </a>
            </li>
            <li>
              <a data-href="#whatido" href="#whatido">
                <HoverLinks text="What I Do" />
              </a>
            </li>
            <li>
              <a data-href="#experience" href="#experience">
                <HoverLinks text="Experience" />
              </a>
            </li>
            <li>
              <a data-href="#work" href="#work">
                <HoverLinks text="My Work" />
              </a>
            </li>
            <li>
              <a data-href="#contact" href="#contact">
                <HoverLinks text="Contact" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
