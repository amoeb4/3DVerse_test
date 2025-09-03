import { useEffect, useState } from "react";
import { DOM3DOverlay, DOM3DElement, useEntity } from "@3dverse/livelink-react";
import { vec3, mat4 } from "gl-matrix";
import type { EntityWithParentId } from "./partEntitiesContext";

interface Dom3DInfosProps {
  entitiesMap?: Map<string, EntityWithParentId>;
}

export default function Dom3DInfos({ entitiesMap }: Dom3DInfosProps) {
  const { entity: part_1 } = useEntity({ euid: "3bd3e72c-3082-466d-af8b-b477735d6c68" });
  const { entity: part_2 } = useEntity({ euid: "ecf78ebe-0ca1-4bb4-98ce-49222bd745b2" });
  const { entity: part_3 } = useEntity({ euid: "2ff894de-d51d-4b28-8794-31cf16bbb957" });
  const { entity: part_4 } = useEntity({ euid: "c5dd1b61-85d4-471d-a460-b35301f319f1" });
  const { entity: part_5 } = useEntity({ euid: "a6721617-08ec-4bef-911e-35baee70fa7d" });
  const { entity: part_6 } = useEntity({ euid: "f5215d69-b99d-4890-859d-409051d8295d" });

  const [positions, setPositions] = useState<Record<string, [number, number, number] | undefined>>({
    part_1: undefined,
    part_2: undefined,
    part_3: undefined,
    part_4: undefined,
    part_5: undefined,
    part_6: undefined,
  });

  // Helper pour extraire la position depuis ls_to_ws
  const getPosition = (entity: any): [number, number, number] | undefined => {
    return entity?.ls_to_ws
      ? [entity.ls_to_ws[12], entity.ls_to_ws[13], entity.ls_to_ws[14]]
      : undefined;
  };

  // Construction dynamique des positions à partir de ls_to_ws
  const POS_PART_1 = getPosition(part_1);
  const POS_PART_2 = getPosition(part_2);
  const POS_PART_3 = getPosition(part_3);
  const POS_PART_4 = getPosition(part_4);
  const POS_PART_5 = getPosition(part_5);
  const POS_PART_6 = getPosition(part_6);

  useEffect(() => {
    const newPositions: Record<string, [number, number, number] | undefined> = {};
    
    // Tableau des entités et leurs positions correspondantes
    const entities = [part_1, part_2, part_3, part_4, part_5, part_6];
    const partPositions = [POS_PART_1, POS_PART_2, POS_PART_3, POS_PART_4, POS_PART_5, POS_PART_6];
    
    // Application des positions pour chaque entité
    entities.forEach((entity, index) => {
      const position = partPositions[index];
      newPositions[`part_${index + 1}`] = position;
    });
    
    setPositions(prevPositions => ({ ...prevPositions, ...newPositions }));
  }, [part_1, part_2, part_3, part_4, part_5, part_6]);

  return (
    <DOM3DOverlay>
      {positions.part_1 && (
        <DOM3DElement worldPosition={positions.part_1} scaleFactor={0.0016}>
          <p className="bg-underground p-4 rounded-lg text-white">Base<br />Axe Z</p>
        </DOM3DElement>
      )}
      {positions.part_2 && (
        <DOM3DElement worldPosition={positions.part_2} scaleFactor={0.0016}>
          <p className="bg-underground p-4 rounded-lg text-white">Epaule<br />Axe X</p>
        </DOM3DElement>
      )}
      {positions.part_3 && (
        <DOM3DElement worldPosition={positions.part_3} scaleFactor={0.0016}>
          <p className="bg-underground p-4 rounded-lg text-white">Coude 1<br />Axe Z</p>
        </DOM3DElement>
      )}
      {positions.part_4 && (
        <DOM3DElement worldPosition={positions.part_4} scaleFactor={0.0016}>
          <p className="bg-underground p-4 rounded-lg text-white">Bras<br />Axe Z</p>
        </DOM3DElement>
      )}
      {positions.part_5 && (
        <DOM3DElement worldPosition={positions.part_5} scaleFactor={0.0016}>
          <p className="bg-underground p-4 rounded-lg text-white">Coude 2<br />Axe Z</p>
        </DOM3DElement>
      )}
      {positions.part_6 && (
        <DOM3DElement worldPosition={positions.part_6} scaleFactor={0.0016}>
          <p className="bg-underground p-4 rounded-lg text-white">Coude 3<br />Axe X</p>
        </DOM3DElement>
      )}
    </DOM3DOverlay>
  );
}