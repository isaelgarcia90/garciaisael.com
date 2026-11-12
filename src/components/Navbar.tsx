import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import ThemeSwitcher from "./ThemeSwitcher";
import { MdClose, MdMenu } from "react-icons/md";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Mobile menu: close on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

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
        const offset = window.innerWidth <= 1024 ? "top 64px" : "top top";
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
          <a href="/#" className="navbar-title" data-cursor="disable">
            IG
          </a>
          <ThemeSwitcher />
        </div>
        <a
          href="https://www.linkedin.com/in/isaelgarcia90"
          className="navbar-connect"
          data-cursor="disable"
          target="_blank"
          rel="noreferrer"
        >
          linkedin.com/in/isaelgarcia90
        </a>
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
                <HoverLinks text="ABOUT" />
              </a>
            </li>
            <li>
              <a data-href="#whatido" href="#whatido">
                <HoverLinks text="WHAT I DO" />
              </a>
            </li>
            <li>
              <a data-href="#experience" href="#experience">
                <HoverLinks text="EXPERIENCE" />
              </a>
            </li>
            <li>
              <a data-href="#work" href="#work">
                <HoverLinks text="MY WORK" />
              </a>
            </li>
            <li>
              <a data-href="#contact" href="#contact">
                <HoverLinks text="CONTACT" />
              </a>
            </li>
            <li className="menu-resume">
              <a href="/Isael_Garcia__CV.pdf" target="_blank" rel="noreferrer">
                RESUME
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
