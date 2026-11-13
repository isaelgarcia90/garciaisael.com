import { lazy, PropsWithChildren, Suspense, useEffect, useRef, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";
import { onWidthResize } from "./utils/widthResize";
import { initialFX } from "./utils/initialFX";
import { notifyVisit, trackSectionViews } from "./utils/analytics";
import { MdScreenRotation } from "react-icons/md";

const TechStack = lazy(() => import("./TechStack"));

// The Techstack 3D scene (and its textures) only downloads when the visitor
// gets within one screen of it; until then an empty box of the same size holds its place.
const DeferredTechStack = () => {
  const slot = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near || !slot.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "100% 0px" }
    );
    io.observe(slot.current);
    return () => io.disconnect();
  }, [near]);
  if (!near) return <div className="techstack" ref={slot} />;
  return (
    <Suspense fallback={<div className="techstack" />}>
      <TechStack />
    </Suspense>
  );
};

// Rotate notice in the visitor's language: Spanish phones get Spanish
const ROTATE_TEXT = (navigator.language || "").toLowerCase().startsWith("es")
  ? "Gira tu teléfono a vertical"
  : "Rotate your phone to portrait";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    return onWidthResize(resizeHandler);
  }, [isDesktopView]);

  // Google Analytics: report which sections each visitor reaches
  useEffect(() => trackSectionViews(), []);
  useEffect(() => notifyVisit(), []);

  // The page intro (texts, menu, scroll) starts from Scene.tsx when the character lights turn on.
  // Fallback: if the model fails to load, start it anyway so the page never stays hidden.
  useEffect(() => {
    const fallback = setTimeout(() => initialFX(), 15000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <div className="container-main">
      {/* Phones turned sideways: ask to go back to portrait (shown only by CSS) */}
      <div className="rotate-notice" aria-hidden="true">
        <MdScreenRotation />
        <p>{ROTATE_TEXT}</p>
      </div>
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            {isDesktopView && <DeferredTechStack />}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
