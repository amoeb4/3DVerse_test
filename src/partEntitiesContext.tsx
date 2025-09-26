import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext, useEntity } from "@3dverse/livelink-react";
import { Entity, Scene } from "@3dverse/livelink";
import type { Vec3, Quat } from "@3dverse/livelink.core";
//import { debugEntityTransform } from "./debugTools";
import * as THREE from 'three';
//import { OneFactor, StereoCamera } from "three";
//import { add } from "three/tsl";
//import { GPU_CHUNK_BYTES } from "three/src/renderers/common/Constants.js";
import { mat4, quat, vec3 } from 'gl-matrix';

export type EntityWithParentId = Entity & {
  __parentId: string | null;
  ls_to_ws_local?: mat4;
  localPos: vec3;
  localRot: quat;
  ls_to_ws: mat4;
  worldPos?: vec3;
  worldRot?: quat;
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
  const { entity: part_1 } = useEntity({ euid: "91153236-a05e-4127-a1c0-49b5761c41e3" });
  const { entity: part_2 } = useEntity({ euid: "ec221ded-08df-4bae-8982-bb47c82a0917" });
  const { entity: part_3 } = useEntity({ euid: "32cda313-895a-42e1-a5f6-dd50e398c332" });
  const { entity: part_4 } = useEntity({ euid: "96b43de7-3c72-4ae5-8d1f-b2137c50bc61" });
  const { entity: part_5 } = useEntity({ euid: "ed84c3ff-3c7f-445a-a1ff-d531c8f47133" });
  const { entity: part_6 } = useEntity({ euid: "1274b32e-4d37-41cb-ad2b-0ed4886bf918" });
  const { entity: part_7 } = useEntity({ euid: "df0b0b6f-789d-46a4-be69-4def0f8e1494" });
  const { entity: part_8 } = useEntity({ euid: "2276b2a3-8a16-4d42-934d-fee7376fab25" });
  
  const [entities, setEntities] = useState<EntityWithParentId[]>([]);
  const [entitiesMap, setEntitiesMap] = useState<Map<string, EntityWithParentId>>(new Map());

  useEffect(() => {
    const parts = [part_1, part_2, part_3, part_4, part_5, part_6, part_7, part_8].filter((entity): entity is Entity => entity !== null);
    
    if (parts.length === 0) {
      console.warn("⛔ Aucune entité chargée");
      return;
    }
    console.log(`🔍 PartEntitiesByEuid: ${parts.length} entités récupérées via EUID`);
    // Enrichissement des entités avec parentId
    const enriched: EntityWithParentId[] = parts.map((entity) => {
      (entity as EntityWithParentId).__parentId = entity.parent?.id ?? null;
      entity.auto_broadcast = false;
      return entity as EntityWithParentId;
    });

    // Tri par numéro de part
    enriched.sort((a, b) => {
      const numA = parseInt(a.name!.split("_")[1], 10);
      const numB = parseInt(b.name!.split("_")[1], 10);
      return numA - numB;
    });

    setEntities(enriched);
    setEntitiesMap(new Map(enriched.map((e) => [e.name!, e])));
    console.log(`✅ Chargé ${enriched.length} entités dans entitiesMap`);

  }, [part_1, part_2, part_3, part_4, part_5, part_6, part_7, part_8]);

  return (
    <PartEntitiesContext.Provider value={{ entities, entitiesMap }}>
      {children}
    </PartEntitiesContext.Provider>
  );
}

export function applyRotationToEntity(entity: Entity, matrix: mat4) {
  const rotation = quat.create();
  mat4.getRotation(rotation, matrix);
  const orientation: Quat = Array.from(rotation) as Quat;
  entity.local_transform = {
    orientation,
  };
}

export function rotateHierarchy(
  entityName: string,
  deltaQuatDeg: [number, number, number],
  entitiesMap: Map<string, EntityWithParentId>
) {
  const entity = [...entitiesMap.values()].find((e) => e.name === entityName);
  if (!entity) {
    console.warn(`Entité ${entityName} introuvable`);
    return;
  }
  entity.local_transform.eulerOrientation = deltaQuatDeg;
  //console.debug("rotateHierarchy altered entity", entity.name, entity.euid);
}

export async function rotateHierarchyProgressive(
  entityName: string,
  deltaQuatDeg: [number, number, number],
  entitiesMap: Map<string, EntityWithParentId>,
  delayMs: number,
  stepDeg: number = 1
) {
  const entity = [...entitiesMap.values()].find((e) => e.name === entityName);
  if (!entity) {
    console.warn(`Entité ${entityName} introuvable`);
    return;
  }
  const [totalDx, totalDy, totalDz] = deltaQuatDeg;

  const steps = Math.max(
    Math.ceil(Math.abs(totalDx) / stepDeg),
    Math.ceil(Math.abs(totalDy) / stepDeg),
    Math.ceil(Math.abs(totalDz) / stepDeg)
  );

  const stepDx = totalDx / steps;
  const stepDy = totalDy / steps;
  const stepDz = totalDz / steps;

  for (let i = 0; i < steps; i++) {
    applyStepRotation(entity, [stepDx, stepDy, stepDz]);
    await sleep(delayMs);
  }

  applyStepRotation(entity, [
    totalDx - stepDx * steps,
    totalDy - stepDy * steps,
    totalDz - stepDz * steps,
  ]);
}

function applyStepRotation(
  entity: EntityWithParentId,
  deltaDeg: [number, number, number]
) {
  const [dx, dy, dz] = deltaDeg;
  const eulerRad = new THREE.Euler(
    (dx * Math.PI) / 180,
    (dy * Math.PI) / 180,
    (dz * Math.PI) / 180,
    "ZYX"
  );
  
  const deltaQuat = new THREE.Quaternion().setFromEuler(eulerRad);
  const [qx, qy, qz, qw] = entity.local_transform.orientation ?? [0, 0, 0, 1];
  const currentQuat = new THREE.Quaternion(qx, qy, qz, qw);
  const newQuat = deltaQuat.multiply(currentQuat).normalize();

  entity.local_transform.orientation = [
    newQuat.x,
    newQuat.y,
    newQuat.z,
    newQuat.w,
  ];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}