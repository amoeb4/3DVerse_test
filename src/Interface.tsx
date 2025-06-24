import { createContext, useContext, useState, ReactNode } from "react";

type SpeedContextType = {
  speed: number;
  setSpeed: (value: number) => void;
};

const SpeedContext = createContext<SpeedContextType | undefined>(undefined);

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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value) / 10;
    setSpeed(newSpeed);
  };

return (
  <div style={controlInterfaceStyle}>
    <h1>Control Panel</h1>
    <button className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100">
      DO A FLIP!!!
    </button>
    <button className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100">
      Apply changes
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