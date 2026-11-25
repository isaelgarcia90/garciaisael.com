import { useEffect, useRef, useState } from "react";
import { TbHeadphones, TbPlayerPauseFilled } from "react-icons/tb";
import { smoother } from "./Navbar";
import { trackEvent } from "./utils/analytics";
import { asset } from "../assetVersion";
import "./styles/NarrationButton.css";

// One narration clip per section, in page order. The audio was generated once
// with ElevenLabs (voice "Brian") and ships as static files, so no API key is
// ever used by the site. Scripts and how to regenerate: docs/narration.md.
// If a clip is replaced, bump ASSET_VERSION (audio is cached for a year).
const CLIPS = [
  { selector: "#landingDiv", src: "/audio/narration-1.mp3", section: "landing" },
  { selector: "#about", src: "/audio/narration-2.mp3", section: "about" },
  { selector: "#whatido", src: "/audio/narration-3.mp3", section: "what_i_do" },
  { selector: "#experience", src: "/audio/narration-4.mp3", section: "career" },
  { selector: "#work", src: "/audio/narration-5.mp3", section: "work" },
  { selector: "#contact", src: "/audio/narration-6.mp3", section: "contact" },
];

// Section the visitor is looking at: the last one whose top is above mid-screen
const currentClip = () => {
  let index = 0;
  CLIPS.forEach((clip, i) => {
    const el = document.querySelector(clip.selector);
    if (el && el.getBoundingClientRect().top < window.innerHeight / 2) index = i;
  });
  return index;
};

// Scroll to a section the same way the menu links do (same offsets per device)
const goToSection = (index: number) => {
  if (index === 0) {
    if (smoother) smoother.scrollTo(0, true);
    return;
  }
  const link = document.querySelector<HTMLAnchorElement>(
    `.header ul a[data-href="${CLIPS[index].selector}"]`
  );
  link?.click();
};

const NarrationButton = () => {
  const audio = useRef<HTMLAudioElement | null>(null);
  const index = useRef(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = new Audio();
    el.preload = "none";
    audio.current = el;
    const onEnded = () => {
      const next = index.current + 1;
      if (next >= CLIPS.length) {
        index.current = 0;
        setPlaying(false);
        trackEvent("narration_complete");
        return;
      }
      playClip(next, true);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);
    return () => {
      el.pause();
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  const playClip = (i: number, scroll: boolean) => {
    const el = audio.current;
    if (!el) return;
    index.current = i;
    el.src = asset(CLIPS[i].src);
    if (scroll) goToSection(i);
    el.play().catch(() => setPlaying(false));
  };

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    const here = currentClip();
    trackEvent("narration_play", { section: CLIPS[here].section });
    // Paused in the same section: continue where it stopped
    if (el.src && here === index.current && !el.ended && el.currentTime > 0) {
      el.play().catch(() => setPlaying(false));
      return;
    }
    playClip(here, false);
  };

  return (
    <button
      type="button"
      className={`narration-button ${playing ? "playing" : ""}`}
      onClick={toggle}
      data-cursor="disable"
      aria-label={playing ? "Pause narration" : "Listen: narrated tour"}
      aria-pressed={playing}
      title={playing ? "Pause" : "Listen"}
    >
      {playing ? <TbPlayerPauseFilled /> : <TbHeadphones />}
    </button>
  );
};

export default NarrationButton;
