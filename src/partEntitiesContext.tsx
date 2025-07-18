import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
import type { Entity } from "@3dverse/livelink";

export type EntityWithParentId = Entity & {
  __parentId: string | null;
};

export async function getDescendants(
  root: EntityWithParentId,
  entitiesMap: Map<string, EntityWithParentId>
): Promise<EntityWithParentId[]> {
  const descendants: EntityWithParentId[] = [];
  const visited = new Set<string>();

  const walk = (entity: EntityWithParentId) => {
    visited.add(entity.id);

    for (const [, child] of entitiesMap) {
      if (child.__parentId === entity.id && !visited.has(child.id)) {
        descendants.push(child);
        walk(child);
      }
    }
  };

  walk(root);
  return descendants;
}

type PartEntitiesContextType = {
  entities: EntityWithParentId[];
  entitiesMap: Map<string, EntityWithParentId>;
};

export const PartEntitiesContext = createContext<PartEntitiesContextType>({
  entities: [],
  entitiesMap: new Map(),
});

export function PartEntitiesProvider({ children }: { children: React.ReactNode }) {
  const { instance } = useContext(LivelinkContext);
  const [entities, setEntities] = useState<EntityWithParentId[]>([]);
  const [entitiesMap, setEntitiesMap] = useState<Map<string, EntityWithParentId>>(new Map());

  useEffect(() => {
    const fetchEntities = async () => {
      if (!instance) {
        console.warn("⛔ instance Livelink non disponible");
        return;
      }

      console.log("🔍 fetchEntities lancé…");

      try {
        const foundEntities = await instance.scene.findEntitiesWithComponents({
          mandatory_components: ["local_transform"],
          forbidden_components: [],
        });

        console.log(`📦 ${foundEntities.length} entités récupérées depuis la scène`);

        const filtered = foundEntities.filter(
          (entity) => typeof entity.name === "string" && /^part_\d+$/.test(entity.name)
        );

        console.log(`🧽 ${filtered.length} entités filtrées avec le pattern /part_\\d+/`);

        const enriched: EntityWithParentId[] = filtered.map((entity) => {
          (entity as EntityWithParentId).__parentId = entity.parent?.id ?? null;
          return entity as EntityWithParentId;
        });

        enriched.sort((a, b) => {
          const numA = parseInt(a.name!.split("_")[1], 10);
          const numB = parseInt(b.name!.split("_")[1], 10);
          return numA - numB;
        });

        console.log("🧩 Entités triées et enrichies :", enriched.map((e) => e.name));

        setEntities(enriched);
        setEntitiesMap(new Map(enriched.map((e) => [e.name!, e])));

        console.log(`✅ Chargé ${enriched.length} entités dans entitiesMap`);
      } catch (err) {
        console.error("❌ Erreur chargement des entités part_x :", err);
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