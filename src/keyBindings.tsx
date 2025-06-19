import { useEffect } from "react";
import { startVals } from "./CameraEventListener.jsx";
export default function KeyboardHandler() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => 
	{
      if (event.key === "k" || event.key === "K") 
	  {
        console.log("Pressed 'K' key!");
      }
	  if (event.key === "j" || event.key === "J")
	  {
		
	  }
	  if (even.key === "l" || event.key === "L")
	  {

	  }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return null;
 }


