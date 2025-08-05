import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  ChangeEvent,
} from "react";
import * as THREE from "three";
import { LivelinkContext } from "@3dverse/livelink-react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { setOrientation } from "./movements";

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

export default function ControlPanel() {
  const { speed, setSpeed } = useSpeed();
  const { selectedEntity } = useEntity();
  const { instance } = useContext(LivelinkContext);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const { speed: delayMs, setSpeed: setDelayMs } = useSpeed();

  const handleSliderChange = (axis: 'x' | 'y' | 'z') => (e: ChangeEvent<HTMLInputElement>) => {
    const newAngle = parseFloat(e.target.value);
    const delta = newAngle - rotation[axis];
    setRotation((prev) => ({ ...prev, [axis]: newAngle }));
    if (instance && selectedEntity?.id) {
      setOrientation(instance, selectedEntity.id, axis, delta);
    }
  };

  if (!isExpanded) {
    return (
      <button
        className="fixed top-[3%] right-[3%] z-50 bg-white/10 text-white border border-white/20 backdrop-blur px-3 py-2 rounded-full shadow hover:bg-white/20 transition"
        onClick={() => setIsExpanded(true)}
      >
      Control Panel
      </button>
    );
  }

  return (
    <div className="fixed top-[3%] right-[3%] z-50 p-6 rounded-xl backdrop-blur bg-white/10 border border-white/20 shadow-xl text-white space-y-6 w-[90vw] max-w-[600px]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Control Panel</h1>
        <button
          className="text-sm bg-white/10 border border-white/30 rounded-md px-2 py-1 hover:bg-white/20 transition"
          onClick={() => setIsExpanded(false)}
        >
        Minimize
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <EntityDropdown />

        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition">
          Apply changes
        </button>

        <button className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition">
          Focus on entity
        </button>

        <button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition">
          Back to start
        </button>
      </div>

      <div className="space-y-4">


<Slider
  label={`Speed: ${delayMs} ms`}
  value={delayMs}
  min={5}
  max={200}
  step={1}
  onChange={(e) => setDelayMs(parseInt(e.target.value, 10))}
  color="purple"
/>
        <Slider
          label={`Rotation X: ${rotation.x}°`}
          value={rotation.x}
          min={-180}
          max={180}
          onChange={handleSliderChange("x")}
          color="red"
        />
        <Slider
          label={`Rotation Y: ${rotation.y}°`}
          value={rotation.y}
          min={-180}
          max={180}
          onChange={handleSliderChange("y")}
          color="blue"
        />
        <Slider
          label={`Rotation Z: ${rotation.z}°`}
          value={rotation.z}
          min={-180}
          max={180}
          onChange={handleSliderChange("z")}
          color="green"
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (e: any) => void;
  color: "green" | "blue" | "purple" | "red";
}) {
  const colorClasses: Record<string, string> = {
    green: "accent-green-500",
    blue: "accent-blue-500",
    purple: "accent-purple-500",
    red: "accent-red-500",
  };

  return (
    <div className="flex flex-col w-full max-w-xl">
      <label className="mb-1 font-medium text-sm">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorClasses[color]} bg-gray-200`}
      />
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
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 shadow ring-1 ring-gray-300 hover:bg-gray-100">
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