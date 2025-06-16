import { useEffect, useContext } from "react";
import { LivelinkContext, useCameraEntity } from "@3dverse/livelink-react";

export default function CameraEventListener() {
  const { cameraEntity } = useCameraEntity();
  const { engine } = useContext(LivelinkContext);

  useEffect(() => {
    if (!engine || !cameraEntity) return;
    const handleUpdate = (event) => {
      console.log("Camera event triggered:", event);
    };
    engine.event.addEventListener("transform-updated", handleUpdate, cameraEntity);
    return () => {
      engine.event.removeEventListener("transform-updated", handleUpdate, cameraEntity);
    };
  }, [engine, cameraEntity]);

  return null;
}