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

  // ✅ Buffer des messages reçus trop tôt
  const messageQueue = useRef<any[]>([]);

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
  console.log("📨 onmessage triggered:", msg);
  try {
    const parsed = JSON.parse(msg);
    console.log("✅ Parsed JSON:", parsed);

    if (
      typeof parsed === "object" &&
      typeof parsed.name === "string" &&
      Array.isArray(parsed.location) &&
      parsed.location.length === 3
    ) {
      const [x, y, z] = parsed.location;
      console.log("🧮 Parsed location:", [x, y, z]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        if (instance && entitiesMap.size > 0) {
          console.log(`🔄 Moving entity ${parsed.name} and children to [${x}, ${y}, ${z}]`);
          await moveEntityAndChildren(parsed.name, [x, y, z], entitiesMap, instance);
        } else {
          console.warn(`⏳ instance or entitiesMap not ready yet, queuing message`);
          // ici ta queue de messages si tu en as
        }
        return;
      }
    }

    if (parsed.select && typeof parsed.select === "string") {
      console.log(`🎯 Selecting entity ${parsed.select}`);
      setSelectedEntityName(parsed.select);
      return;
    }

    console.warn("⚠️ Ignored unknown JSON message:", parsed);
    return;
  } catch (e) {
    console.warn("⚠️ Message is not JSON, falling back to legacy split-based parsing");

    const parts = msg.split(" ");
    console.log("🪓 Fallback split parts:", parts);

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
  }
};

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
      const timeout = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= 5) {
        console.log("❌ Too many connection attempts, aborting.");
        return;
      }

      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectWebSocket();
      }, timeout);
      console.log(`🔄 Reconnecting in ${timeout}ms...`);
    };
  }, [instance, entitiesMap]);
useEffect(() => {
  console.log("🧪 Flush trigger - instance:", instance, "entitiesMap.size:", entitiesMap.size);

  if (instance && entitiesMap.size > 0 && messageQueue.current.length > 0) {
    console.log("📬 Flushing queued messages...");
    const toProcess = [...messageQueue.current];
    messageQueue.current = [];

    toProcess.forEach(async (parsed) => {
      const [x, y, z] = parsed.location.map(Number);
      console.log(`🔄 Processing queued message for ${parsed.name} -> [${x}, ${y}, ${z}]`);
      await moveEntityAndChildren(parsed.name, [x, y, z], entitiesMap, instance);
    });
  }
}, [instance, entitiesMap]);

  // 📡 Lancer la connexion dès que le composant est monté
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