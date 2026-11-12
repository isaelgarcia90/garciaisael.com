import { useEffect, useRef, useState } from "react";
import { THEMES } from "../theme/themes";
import { applyTheme, getTheme, onThemeChange } from "../theme/theme";
import "./styles/ThemeSwitcher.css";

const ThemeSwitcher = () => {
  const [current, setCurrent] = useState(getTheme());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => onThemeChange(setCurrent), []);

  // Close the menu when clicking outside of it
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="theme-switcher" ref={ref}>
      <button
        type="button"
        className="theme-switcher-button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Color mode: ${current.name}`}
      >
        <span className="theme-dot" />
        <span className="theme-switcher-name">{current.name}</span>
        <span className="theme-switcher-chevron">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="theme-switcher-menu" role="listbox">
          {THEMES.map((t) => (
            <div
              key={t.id}
              role="option"
              aria-selected={t.id === current.id}
              className={`theme-option ${t.id === current.id ? "active" : ""}`}
              onClick={() => {
                applyTheme(t.id);
                setOpen(false);
              }}
            >
              <span
                className="theme-dot"
                style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
              />
              {t.name}
              {t.id === current.id && <span className="theme-check">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
