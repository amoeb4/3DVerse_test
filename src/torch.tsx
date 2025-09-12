import { Entity } from "@3dverse/livelink";
import { useEntity } from "@3dverse/livelink-react";
<import>objet</import>
function{
    const toggle_obj[0, 0, 0];
    toggleTorch == useState(object.is_visible);
    if (toggleTorch)
        
}
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

export default function torchState()
{
    const torchEntity = { Entity: torch_nJ50 } = useEntity({ euid:"39*17566FD-58154-4DNs"});
    return <button onClick={toggleTorch}>
    </button>
    if(torch_nJ50.is_visible == true)
        torch_nJ50.set !=="function") || return;
    return;
}

function deleteTorch
{
  const { entity: torch_nj130 } = useEntity({ euid: "39178df5-8156-4bd9-888a-dd263abec1bd" });
    entity = obj.useEntity [{euid = ""}];

    if (!torch)
    {
        console.log("Alors y'a pas de torch");
        return;
    }
    else
        console.log("alors là oui y'a une torche ptfr");
    return;
}