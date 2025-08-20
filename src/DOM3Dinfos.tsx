import { useEffect, useState } from "react";
import { DOM3DOverlay, DOM3DElement } from "@3dverse/livelink-react";
import { vec3, mat4 } from "gl-matrix";
import type { EntityWithParentId } from "./partEntitiesContext";

interface Dom3DInfosProps {
  entitiesMap?: Map<string, EntityWithParentId>;
}

export default function Dom3DInfos({ entitiesMap }: Dom3DInfosProps) {
  const [positions, setPositions] = useState<Record<string, [number, number, number]>>({
    part_1: [-1.7, 0.6, 0],
    part_2: [-0.3, 0.8, 0],
    part_3: [-1.2, 1.69, 0],
    part_4: [-0.6, 2.28, 0.1],
    part_5: [0.4, 2.25, 0.1],
    part_6: [0.6, 1.65, 0.1],
  });

  useEffect(() => {
    if (!entitiesMap || entitiesMap.size === 0) return;

    const newPositions: Record<string, [number, number, number]> = { ...positions };
    for (let i = 1; i <= 6; i++) {
      const entity = [...entitiesMap.values()].find((e) => e.name === `part_${i}`);
      if (!entity) continue;
      const mat = mat4.clone(entity.ls_to_ws as unknown as mat4);
      const pos = vec3.create();
      mat4.getTranslation(pos, mat);
      newPositions[`part_${i}`] = [pos[0], pos[1], pos[2]];
    }
    setPositions(newPositions);
  }, [entitiesMap]);

  return (
    <DOM3DOverlay>
      <DOM3DElement worldPosition={positions.part_1} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">Base<br />Axe Z</p>
      </DOM3DElement>
      <DOM3DElement worldPosition={positions.part_2} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">Epaule<br />Axe X</p>
      </DOM3DElement>
      <DOM3DElement worldPosition={positions.part_3} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">Coude 1<br />Axe Z</p>
      </DOM3DElement>
      <DOM3DElement worldPosition={positions.part_4} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">Bras<br />Axe Z</p>
      </DOM3DElement>
      <DOM3DElement worldPosition={positions.part_5} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">Coude 2<br />Axe Z</p>
      </DOM3DElement>
      <DOM3DElement worldPosition={positions.part_6} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">Coude 3<br />Axe X</p>
      </DOM3DElement>
    </DOM3DOverlay>
  );
}
