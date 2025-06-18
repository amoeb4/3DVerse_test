import { useEffect } from "react";

export default function KeyboardHandler() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" || event.key === "K") {
        console.log("Pressed 'K' key!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return null;
 }
