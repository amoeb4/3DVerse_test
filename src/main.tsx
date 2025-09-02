import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer as NodeBuffer } from "buffer";
import "./index.css";
import App from "./App";

if (!(window as any).Buffer) {
  (window as any).Buffer = NodeBuffer;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);