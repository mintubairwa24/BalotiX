/**
 * src/main.jsx
 *
 * Mounts the React application into the DOM. React 18 concurrent mode
 * via createRoot. StrictMode is on in development (auto-stripped in
 * the production build by Vite).
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
