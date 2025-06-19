import { useContext, useEffect } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";

export default function KeyboardHandler() {
  const { instance, isConnecting, isDisconnected } = useContext(LivelinkContext);

useEffect(() => {
  if (!instance) return;

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "j") {
      try {
        const entities = await instance.scene.findEntitiesWithComponents({
          mandatory_components: ["local_transform"],
          forbidden_components: [],
        });

        // Récupération des UUIDs
        const uuids = entities.map(e => e.id);

        // Récupération des noms via findEntities (par UUID)
        const entitiesWithNames = await Promise.all(
          uuids.map(async (uuid) => {
            const result = await instance.scene.findEntities({ entity_uuid: uuid });
            // result est un tableau, on prend le premier (s'il existe)
            const ent = result[0];
            return {
              uuid,
              name: ent?.name || "(sans nom)",
            };
          })
        );

        console.log("Entités avec nom et UUID :", entitiesWithNames);
      } catch (error) {
        console.error("Erreur :", error);
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [instance]);}
