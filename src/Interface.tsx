import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  ChangeEvent,
} from "react";
import * as THREE from 'three';
import { LivelinkContext } from "@3dverse/livelink-react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type SpeedContextType = {
  speed: number;
  setSpeed: (value: number) => void;
};
export const SpeedContext = createContext<SpeedContextType | undefined>(undefined);

export const useSpeed = () => {
  const context = useContext(SpeedContext);
  if (!context) throw new Error("useSpeed must be used within a SpeedProvider");
  return context;
};

export const SpeedProvider = ({ children }: { children: ReactNode }) => {
  const [speed, setSpeed] = useState(1);
  return <SpeedContext.Provider value={{ speed, setSpeed }}>{children}</SpeedContext.Provider>;
};

type Entity = { id: string; name?: string };
type EntityContextType = {
  selectedEntity: Entity | null;
  setSelectedEntity: (entity: Entity) => void;
};
const EntityContext = createContext<EntityContextType | undefined>(undefined);
export const useEntity = () => {
  const context = useContext(EntityContext);
  if (!context) throw new Error("useEntity must be used within an EntityProvider");
  return context;
};
export const EntityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  return (
    <EntityContext.Provider value={{ selectedEntity, setSelectedEntity }}>
      {children}
    </EntityContext.Provider>
  );
};

// --- Utilitaires ---
export function eulerToQuat(x: number, y: number, z: number): [number, number, number, number] {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const c1 = Math.cos(rad(y) / 2), s1 = Math.sin(rad(y) / 2);
  const c2 = Math.cos(rad(z) / 2), s2 = Math.sin(rad(z) / 2);
  const c3 = Math.cos(rad(x) / 2), s3 = Math.sin(rad(x) / 2);
  return [
    c1 * c2 * s3 - s1 * s2 * c3,
    c1 * s2 * c3 + s1 * c2 * s3,
    s1 * c2 * c3 - c1 * s2 * s3,
    c1 * c2 * c3 + s1 * s2 * s3
  ];
}

const controlInterfaceStyle = {
  position: "fixed" as const,
  left: "5%",
  right: "5%",
  top: "3%",
  backgroundColor: "#263238",
  color: "white",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
  zIndex: 1000,
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
};

export default function ControlPanel() {
  const { speed, setSpeed } = useSpeed();
  const { selectedEntity } = useEntity();
  const { instance } = useContext(LivelinkContext);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  const handleSliderChange = (axis: 'x' | 'y' | 'z') => (e: ChangeEvent<HTMLInputElement>) => {
    const newAngle = parseFloat(e.target.value);
    const delta = newAngle - rotation[axis];
    setRotation((prev) => ({ ...prev, [axis]: newAngle }));
    if (instance && selectedEntity?.id) {
      setOrientation(instance, selectedEntity.id, axis, delta);
    }
  };

  async function setOrientation(
    instance: any,
    entityId: string,
    axis: 'x' | 'y' | 'z',
    deltaDeg: number
  ) {
    const [fullEntity] = await instance.scene.findEntities({ entity_uuid: entityId });
    if (!fullEntity) return console.warn(`Entité avec UUID ${entityId} introuvable`);

    const currentQuat = new THREE.Quaternion(...(fullEntity.local_transform.orientation ?? [0, 0, 0, 1]));
    const deltaEuler =
      axis === 'x'
        ? new THREE.Euler(THREE.MathUtils.degToRad(deltaDeg), 0, 0, 'XYZ')
        : axis === 'y'
        ? new THREE.Euler(0, THREE.MathUtils.degToRad(deltaDeg), 0, 'XYZ')
        : new THREE.Euler(0, 0, THREE.MathUtils.degToRad(deltaDeg), 'XYZ');

    const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
    const newQuat = deltaQuat.multiply(currentQuat).normalize();

    fullEntity.local_transform.orientation = [newQuat.x, newQuat.y, newQuat.z, newQuat.w];
    console.log(`Orientation mise à jour pour ${entityId} : (${newQuat.x.toFixed(4)}, ${newQuat.y.toFixed(4)}, ${newQuat.z.toFixed(4)}, ${newQuat.w.toFixed(4)})`);
  }

  return (
    <div style={controlInterfaceStyle}>
      <h1 className="text-xl font-semibold mb-2 w-full">Control Panel</h1>
      <EntityDropdown />
      <button onClick={() => console.log("Entité sélectionnée :", selectedEntity)} className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition">Apply changes</button>
      <button className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition">Focus on entity</button>
      <button className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition">Back to start</button>

      <div className="flex flex-col items-center">
        <span className="mb-1 text-sm">{speed.toFixed(1)}x</span>
        <input
          type="range"
          min="0.1"
          max="50"
          value={speed * 10}
          onChange={(e) => setSpeed(parseFloat(e.target.value) / 10)}
          className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="flex flex-col items-center">
        <span className="mb-1 text-sm">Rotation X : {rotation.x}°</span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation.x}
          onChange={handleSliderChange('x')}
          className="w-64 h-2 bg-green-300 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
      </div>

      <div className="flex flex-col items-center">
        <span className="mb-1 text-sm">Rotation Y : {rotation.y}°</span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation.y}
          onChange={handleSliderChange('y')}
          className="w-64 h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
      </div>

      <div className="flex flex-col items-center">
        <span className="mb-1 text-sm">Rotation Z : {rotation.z}°</span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation.z}
          onChange={handleSliderChange('z')}
          className="w-64 h-2 bg-red-300 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
      </div>
    </div>
  );
}

export function EntityDropdown() {
  const { instance } = useContext(LivelinkContext);
  const { selectedEntity, setSelectedEntity } = useEntity();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entitiesMap, setEntitiesMap] = useState<Map<string, Entity>>(new Map());

  useEffect(() => {
    const fetchEntities = async () => {
      if (!instance) return;
      try {
        const foundEntities = await instance.scene.findEntitiesWithComponents({ mandatory_components: ["local_transform"], forbidden_components: [] });
        const entitiesWithNames = foundEntities
          .map((e: any) => ({ id: e.id, name: e.name || "(sans nom)" }))
          .filter((e: Entity) => /^part_\d+$/.test(e.name ?? ""))
          .sort((a, b) => parseInt(a.name!.split("_")[1], 10) - parseInt(b.name!.split("_")[1], 10));
        setEntities(entitiesWithNames);
        setEntitiesMap(new Map(entitiesWithNames.map((e) => [e.name!, e])));
      } catch (err) {
        console.error("Erreur lors de la récupération des entités :", err);
      }
    };
    fetchEntities();
  }, [instance]);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
          {selectedEntity?.name || "Entités"}
          <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
        </MenuButton>
      </div>
      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="py-1">
          {entities.map((entity) => (
            <MenuItem key={entity.id}>
              {({ active }) => (
                <button onClick={() => setSelectedEntity(entity)} className={`${active ? "bg-gray-100 text-gray-900" : "text-gray-700"} block w-full text-left px-4 py-2 text-sm`}>
                  {entity.name}
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}