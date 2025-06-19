import { useContext, useEffect } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";

export default function KeyboardHandler() {
  const { instance } = useContext(LivelinkContext);

  useEffect(() => {
    if (!instance) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "j" || key === "m") {
        try {
          const entities = await instance.scene.findEntitiesWithComponents({
            mandatory_components: ["local_transform"],
            forbidden_components: [],
          });

          if (key === "j") {
            const entitiesWithNames = entities.map((entity) => ({
              uuid: entity.id,
              name: entity.name || "(sans nom)",
            }));
            console.table(entitiesWithNames);
          }

          if (key === "m") {
            for (const entity of entities) {
              const [fullEntity] = await instance.scene.findEntities({
                entity_uuid: entity.id,
              });

              if (fullEntity) {
                const [x, y, z] = fullEntity.local_transform.position;

                fullEntity.local_transform = {
                  position: [x + 1, y + 0.5, z] as [number, number, number],
                };
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors de la manipulation des entités :", error);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [instance]);

  return null;
}