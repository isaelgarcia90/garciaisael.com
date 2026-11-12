import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import ThemeSwitcher from "./ThemeSwitcher";
import { MdClose, MdMenu } from "react-icons/md";
import { TbNotes } from "react-icons/tb";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

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
        const offset =
          window.innerWidth <= 1024 ? `top ${header?.offsetHeight ?? 64}px` : "top top";
        smoother.scrollTo(section, true, offset);
      });
    });
    window.addEventListener("resize", () => {
      ScrollSmoother.refresh(true);
    });
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
