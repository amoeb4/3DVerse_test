import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";

type Entity = { id: string; name?: string };
type PartEntitiesContextType = {
  entities: Entity[];
  entitiesMap: Map<string, Entity>;
};

const PartEntitiesContext = createContext<PartEntitiesContextType>({
  entities: [],
  entitiesMap: new Map(),
});

type EntityWithParent = Entity & {
  getParent?: () => Promise<Entity | null>;
};

export async function getDescendants(root: Entity, entitiesMap: Map<string, Entity>): Promise<Entity[]> {
  const descendants: Entity[] = [];
  const visited = new Set<string>();

  const walk = async (entity: Entity) => {
    visited.add(entity.id);

    for (const [, child] of entitiesMap) {
      const withParent = child as EntityWithParent;
      try {
        const parent = await withParent.getParent?.();
        if (parent?.id === entity.id && !visited.has(child.id)) {
          descendants.push(child);
          await walk(child);
        }
      } catch (err) {
        console.warn(`⚠️ Erreur getParent sur ${child.name ?? "(sans nom)"}`, err);
      }
    }
  };
  await walk(root);
  return descendants;
}

export function PartEntitiesProvider({ children }: { children: React.ReactNode }) {
  const { instance } = useContext(LivelinkContext);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entitiesMap, setEntitiesMap] = useState<Map<string, Entity>>(new Map());

  useEffect(() => {
    const fetchEntities = async () => {
      if (!instance) return;

      try {
        const foundEntities = await instance.scene.findEntitiesWithComponents({
          mandatory_components: ["local_transform"],
          forbidden_components: [],
        });

        const filtered = foundEntities
          .map((entity) => ({
            id: entity.id,
            name: entity.name || "(sans nom)",
          }))
          .filter((entity) => /^part_\d+$/.test(entity.name ?? ""))
          .sort((a, b) => {
            const numA = parseInt(a.name!.split("_")[1], 10);
            const numB = parseInt(b.name!.split("_")[1], 10);
            return numA - numB;
          });

        setEntities(filtered);
        setEntitiesMap(new Map(filtered.map((e) => [e.name!, e])));
      } catch (err) {
        console.error("Erreur chargement des entités part_x :", err);
      }
    };

    fetchEntities();
  }, [instance]);

  return (
    <PartEntitiesContext.Provider value={{ entities, entitiesMap }}>
      {children}
    </PartEntitiesContext.Provider>
  );
}

export function usePartEntities() {
  return useContext(PartEntitiesContext);
}