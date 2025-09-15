import { Entity } from "@3dverse/livelink";
import { useEntity } from "@3dverse/livelink-react";

function toggleEntity(entity?: Entity | null, entity2?: Entity| null) {
  if (entity && entity == entity2)
  {
    entity.is_visible = !entity.is_visible; return;
}
  if (entity2)
    entity2.is_visible = !entity2.is_visible;
  if (entity)
    entity.is_visible = !entity.is_visible;
  if (entity2)
  entity2.is_visible = !entity2.is_visible;
}

export default function TorchExample() {
  const { entity: flame } = useEntity({ euid: "103acb9d-8d29-4281-ba7a-15b0114ffbcf" });
  const { entity: fronius } = useEntity({ euid: "1c8d3c40-76ce-480e-a617-e92ec88d0e10" });
  const { entity: effecteur } = useEntity({ euid: "7ffcfcbb-9b8b-4e23-8a08-22ab3834145b" });

return (
  <div className="flex flex-col gap-2">
    <button onClick={() => toggleEntity(flame, flame)}>Allumer/Éteindre flamme</button>
    <button onClick={() => toggleEntity(fronius, effecteur)}>Broche fronius</button>
    <button onClick={() => toggleEntity(effecteur, fronius)}>Broche effecteur</button>
  </div>
  );
}