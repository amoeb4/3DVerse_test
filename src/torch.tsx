import { useEntity } from "@3dverse/livelink-react";

function lightTorch(torch: any) {
  if (!torch) return;
  (torch as { set: (attrs: Record<string, unknown>) => void }).set({ isVisible: true });
}

export default function TorchExample() {
  const { entity: torch_nj130 } = useEntity({ euid: "39178df5-8156-4bd9-888a-dd263abec1bd" });
  const { entity: torch_nj40 } = useEntity({ euid: "88034d22-118d-418a-b282-c13852bc15ba" });
  return (
    <button
      onClick={() => {
        lightTorch(torch_nj130);
        lightTorch(torch_nj40);
      }}
    >
      Allumer torches
    </button>
  );
}