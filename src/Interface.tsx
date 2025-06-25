import { createContext, useContext, useState, useEffect, ReactNode, ChangeEvent } from "react";
import { quat, vec3 } from "gl-matrix";
import { LivelinkContext } from "@3dverse/livelink-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";


// 1.988/4.896 * (calcul de l'angle) -> Euler to Quaternions

type SpeedContextType = {
  speed: number;
  setSpeed: (value: number) => void;
};

export const SpeedContext = createContext<SpeedContextType | undefined>(undefined);

export const useSpeed = () => {
  const context = useContext(SpeedContext);
  if (!context) {
    throw new Error("useSpeed must be used within a SpeedProvider");
  }
  return context;
};

export const SpeedProvider = ({ children }: { children: ReactNode }) => {
  const [speed, setSpeed] = useState(1);
  return (
    <SpeedContext.Provider value={{ speed, setSpeed }}>
      {children}
    </SpeedContext.Provider>
  );
};

type Entity = { id: string; name?: string };

type EntityContextType = {
  selectedEntity: Entity | null;
  setSelectedEntity: (entity: Entity) => void;
};

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export const useEntity = () => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within an EntityProvider");
  }
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

const controlInterfaceStyle = {
  position: "fixed",
  left: "5%",
  right: "5%",
  top: "3%",
  backgroundColor: "#455a64",
  color: "white",
  padding: "2rem",
  borderRadius: "7px",
  boxShadow: "0px 0px 20px rgba(88, 87, 87, 0.81)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export default function ControlPanel() {
  const { speed, setSpeed } = useSpeed();
  const { selectedEntity } = useEntity();
  const { instance } = useContext(LivelinkContext);

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value) / 10;
    setSpeed(newSpeed);
  };

  const handleApply = () => {
    console.log("Entité sélectionnée :", selectedEntity);
  };

  return (
    <div style={controlInterfaceStyle}>
      <h1>Control Panel</h1>
      <EntityDropdown />

      <button
        onClick={handleApply}
        className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100"
      >
        Apply changes
      </button>

      <button
        className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100"
      >
        Focus on entity
      </button>

      <button className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100">
        Back to start
      </button>

      <div className="flex flex-col items-center">
        <span className="mb-1 text-sm">{speed.toFixed(1)}x</span>
        <input
          type="range"
          min="0.1"
          max="50"
          value={speed * 10}
          onChange={handleSliderChange}
          className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
        />
      </div>
    </div>
  );
}

export function EntityDropdown() {
  const { instance } = useContext(LivelinkContext);
  const { selectedEntity, setSelectedEntity } = useEntity();
  const [entities, setEntities] = useState<{ id: string; name?: string }[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      if (!instance) return;
      try {
        const foundEntities = await instance.scene.findEntitiesWithComponents({
          mandatory_components: ["local_transform"],
          forbidden_components: [],
        });
        const entitiesWithNames = foundEntities.map((entity) => ({
          id: entity.id,
          name: entity.name || "(sans nom)",
        }));
        setEntities(entitiesWithNames);
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
                <button
                  onClick={() => setSelectedEntity(entity)}
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } block w-full text-left px-4 py-2 text-sm`}
                >
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
