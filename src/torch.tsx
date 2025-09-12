import { Entity } from "@3dverse/livelink";
import { useEntity } from "@3dverse/livelink-react";

function toggleTorch(torch: any) {
  if (!torch || typeof torch.set !== "function") return;
  torch.set({ is_visible: !torch.is_visible });
}

export default function TorchExample() {
  const { entity: torch_nj130 } = useEntity({ euid: "39178df5-8156-4bd9-888a-dd263abec1bd" });
  if (!torch_nj130) return <p>Chargement torch ...</p>;
  return (
    <button onClick={() => {
      toggleTorch(torch_nj130);
      console.log("torch state changed:", torch_nj130.is_visible);
    }}>
      Allumer/Éteindre torche
    </button>
  )
}