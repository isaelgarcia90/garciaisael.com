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

// The scroll animations move some sections a little, so once the smooth scroll
// stops, nudge until the title sits exactly at the target (at most twice).
// Any touch or wheel from the visitor cancels it.
let alignToken = 0;
const alignTitle = (
  title: HTMLElement,
  wanted: number,
  goal: number,
  tries = 3,
  prev?: { scroll: number; top: number }
) => {
  const token = ++alignToken;
  const cancel = () => (alignToken += 1);
  window.addEventListener("touchstart", cancel, { once: true, passive: true });
  window.addEventListener("wheel", cancel, { once: true, passive: true });
  const startedAt = performance.now();
  let last = -1;
  let still = 0;
  const check = () => {
    if (token !== alignToken || performance.now() - startedAt > 5000) return;
    const now = smoother.scrollTop();
    still = Math.abs(now - last) < 0.5 ? still + 1 : 0;
    last = now;
    // wait until the smooth scroll reached its goal and stopped
    if (Math.abs(now - goal) > 2 || still < 5) {
      requestAnimationFrame(check);
      return;
    }
    const top = title.getBoundingClientRect().top;
    const diff = top - wanted;
    // How much the title moves per pixel scrolled here (the animations slow it down)
    let rate = 1;
    if (prev && Math.abs(now - prev.scroll) > 1) {
      rate = Math.min(1.5, Math.max(0.2, (prev.top - top) / (now - prev.scroll)));
    }
    const next = Math.max(0, Math.round(now + diff / rate));
    if (Math.abs(diff) > 4 && tries > 0 && next !== Math.round(now)) {
      smoother.scrollTo(next, true);
      alignTitle(title, wanted, next, tries - 1, { scroll: now, top });
    }
  };
  requestAnimationFrame(check);
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
        let y = layoutTop(title) - navH - TITLE_GAP;
        // About Me: wait until the character has finished moving aside
        if (section === "#about") {
          const landing = document.querySelector(".landing-section") as HTMLElement | null;
          y = Math.max(y, landing?.offsetHeight ?? 0);
        }
        y = Math.max(0, Math.round(y));
        smoother.scrollTo(y, true);
        alignTitle(title, navH + TITLE_GAP, y);
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
