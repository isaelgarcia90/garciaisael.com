// Runs the callback only when the window WIDTH changes. On phones and tablets the
// browser address bar hides/shows while scrolling, which fires "resize" with only a
// height change; rebuilding every scroll animation for that is what froze the tablet.
export function onWidthResize(callback: () => void) {
  let lastWidth = window.innerWidth;
  const handler = () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    callback();
  };
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}
