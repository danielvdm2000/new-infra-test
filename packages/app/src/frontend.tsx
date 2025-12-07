/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  // Development: use createRoot with HMR
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // Production: hydrate server-rendered content
  hydrateRoot(elem, app);
}
