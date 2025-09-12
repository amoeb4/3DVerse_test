import { useEntity } from "@3dverse/livelink-react";

function lightTorch(torch: any) {
  if (!torch) return;
  (torch as { set: (attrs: Record<string, unknown>) => void }).set({ isVisible: true });
}

export default function TorchExample() {
  const { entity: torch } = useEntity({ euid: "39178df5-8156-4bd9-888a-dd263abec1bd" });

  return (
    <button onClick={() => lightTorch(torch)}>
      Allumer la torche
    </button>
  );
}