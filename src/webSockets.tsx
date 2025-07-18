import {
  useContext,
  useRef,
  useEffect,
  createContext,
  useCallback,
  useState,
} from "react";
import { useEntity, LivelinkContext } from "@3dverse/livelink-react";
import { PartEntitiesContext } from "./partEntitiesContext";
import { moveEntityAndChildren } from "./manipulationSkel";

const WSContext = createContext({
  register: (_setTransform: any, _name: string) => () => {},
});

export function useWebSocket() {
  return useContext(WSContext);
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
  const { entity: selectedEntity } = useEntity(
    selectedEntityName ? { name: selectedEntityName } : { name: "" }
  );
  const { entitiesMap } = useContext(PartEntitiesContext);
  const { instance } = useContext(LivelinkContext);

  const registry = useRef<{ setter: any; name: string }[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  const selectedEntityRef = useRef<string | null>(null);
useEffect(() => {
  selectedEntityRef.current = selectedEntity?.name ?? null;
}, [selectedEntity]);

const connectWebSocket = useCallback(() => {
  const socket = new WebSocket("ws://localhost:8767");
  socketRef.current = socket;

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
    reconnectAttempts.current = 0;

    if (selectedEntityRef.current) {
      socket.send(`select ${selectedEntityRef.current}`);
    }
  };

  socket.onmessage = async (event) => {
    const msg = event.data.trim();
    console.log("📨 Message received:", msg);

    const parts = msg.split(" ");

    if (parts.length === 4) {
      const [name, xStr, yStr, zStr] = parts;
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      const z = parseFloat(zStr);

      if (name.startsWith("part_") && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
        if (instance && entitiesMap.size > 0) {
          console.log(`🔄 Moving entity ${name} and children to [${x}, ${y}, ${z}]`);
          await moveEntityAndChildren(name, [x, y, z], entitiesMap, instance);
        } else {
          console.warn("⚠️ instance or entitiesMap not ready yet");
        }
        return;
      }
    }

    if (parts.length === 2 && parts[0] === "select") {
      const name = parts[1];
      console.log(`🎯 Selecting entity ${name}`);
      setSelectedEntityName(name);
      return;
    }

    console.warn("⚠️ Ignored non-standard message:", msg);
  };

  socket.onclose = () => {
    console.log("❌ WebSocket closed");
    const timeout = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
    reconnectAttempts.current += 1;

    if (reconnectAttempts.current >= 5) {
      console.log("Too many connection attempts, aborting.");
      return;
    }

    reconnectTimeoutRef.current = window.setTimeout(() => {
      connectWebSocket();
    }, timeout);
    console.log(`🔄 Reconnecting in ${timeout}ms...`);
  };
}, [instance, entitiesMap]);

useEffect(() => {
  connectWebSocket();
  return () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    socketRef.current?.close();
  };
}, []);

  useEffect(() => {
    if (selectedEntity?.name && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(`select ${selectedEntity.name}`);
    }
  }, [selectedEntity]);

  const register = useCallback((setter: any, name: string) => {
    if (!registry.current.some((e) => e.name === name && e.setter === setter)) {
      const entry = { setter, name };
      registry.current.push(entry);
      console.log(`➕ Registered entity: ${name}`);

      return () => {
        registry.current = registry.current.filter((e) => e !== entry);
        console.log(`➖ Unregistered entity: ${name}`);
      };
    }
    return () => {};
  }, []);

  return (
    <WSContext.Provider value={{ register }}>
      {children}
    </WSContext.Provider>
  );
}
