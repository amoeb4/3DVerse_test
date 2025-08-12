import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
import { Entity } from "@3dverse/livelink";
import type { Vec3, Quat } from "@3dverse/livelink.core";
import { debugEntityTransform } from "./debugTools";
import * as THREE from 'three';
//import { OneFactor, StereoCamera } from "three";
//import { add } from "three/tsl";
//import { GPU_CHUNK_BYTES } from "three/src/renderers/common/Constants.js";
import { mat4, quat, vec3 } from 'gl-matrix';
import { WrenchScrewdriverIcon } from "@heroicons/react/20/solid";
import { eulerToQuat } from "./Interface";
import { useSpeed } from "./Interface";

export type EntityWithParentId = Entity & {
  __parentId: string | null;
  ls_to_ws_local?: mat4;
  localPos: vec3;
  localRot: quat;
  ls_to_ws: mat4;
  worldPos?: vec3;
  worldRot?: quat;
};

function quaternionToEuler(q: Quat): Vec3 {
  const [x, y, z, w] = q;
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);
  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);
  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);
  return [roll, pitch, yaw];
}

function getRotationMatrix(matrix: mat4): mat4 {
  const rot = mat4.clone(matrix as mat4);
  rot[12] = 0;
  rot[13] = 0;
  rot[14] = 0;
  return rot;
}

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

        setEntities(enriched);
        setEntitiesMap(new Map(enriched.map((e) => [e.name!, e])));

        console.log(`Chargé ${enriched.length} entités dans entitiesMap`);
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
  deltaQuatDeg: [number, number, number, number],
  entitiesMap: Map<string, EntityWithParentId>
) {
  const entity = [...entitiesMap.values()].find((e) => e.name === entityName);
  if (!entity) {
    console.warn(`Entité ${entityName} introuvable`);
    return;
  }

  const [dx, dy, dz] = deltaQuatDeg;
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

  // Filtrage selon l'axe autorisé
  const allowedAxis = getAllowedAxis(entity.name);
  const [dx, dy, dz] = deltaQuatDeg;
  const filteredDeltaQuatDeg: [number, number, number] = [
    allowedAxis.includes("x") ? dx : 0,
    allowedAxis.includes("y") ? dy : 0,
    allowedAxis.includes("z") ? dz : 0,
  ];

  const [totalDx, totalDy, totalDz] = filteredDeltaQuatDeg;
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

function getAllowedAxis(entityName: string): string[] {
  switch (entityName) {
    case "part_1":
    case "part_3":
    case "part_4":
    case "part_5":
      return ["z"];
    case "part_2":
    case "part_6":
      return ["x"];
    default:
      return ["x", "y", "z"]; // Si jamais l'entité n'est pas listée, autorise tout par défaut
  }
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