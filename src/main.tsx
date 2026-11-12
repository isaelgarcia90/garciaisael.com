import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";
// Loaded last: shared title style and the phone layout
import "./components/styles/consistency.css";
import { applyTheme, getSavedThemeId } from "./theme/theme";

// Apply the saved color mode (or the default) before the first render
applyTheme(getSavedThemeId(), false);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);

