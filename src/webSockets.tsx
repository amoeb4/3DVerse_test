import {
  useContext,
  useRef,
  useEffect,
  createContext,
  useCallback,
  useState,
} from "react";
import { useEntity, LivelinkContext } from "@3dverse/livelink-react";
import { rotateHierarchy, PartEntitiesContext } from "./partEntitiesContext";

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
  const messageQueue = useRef<any[]>([]);
  const [flushTrigger, setFlushTrigger] = useState(0);

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
          (parsed.location.length === 3 || parsed.location.length === 4) &&
          parsed.location.every((n : number) => typeof n === "number")
        ) {
          const [x, y, z, w = 0] = parsed.location;

          if (!isNaN(x) && !isNaN(y) && !isNaN(z) && !isNaN(w)) {
            if (instance && entitiesMap.size > 0) {
              console.log(`🔄 Moving entity ${parsed.name} and children to [${x}, ${y}, ${z}] with rotation ${w}`);
              await rotateHierarchy(parsed.name, [x, y, z, w], entitiesMap);
            } else {
              console.warn("⏳ instance or entitiesMap not ready yet, queuing message");

              const alreadyQueued = messageQueue.current.some(
                (msg) =>
                  msg.name === parsed.name &&
                  JSON.stringify(msg.location) === JSON.stringify([x, y, z, w])
              );
              if (!alreadyQueued) {
                messageQueue.current.push({ name: parsed.name, location: [x, y, z, w] });
                setFlushTrigger((prev) => prev + 1);
              }
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
      } catch (e) {
        console.warn("⚠️ Message is not JSON, falling back to legacy split-based parsing");

        const parts = msg.split(" ");
        if ((parts.length === 4 || parts.length === 5) && parts[0].startsWith("part_")) {
          const [name, xStr, yStr, zStr, wStr] = parts;
          const x = parseFloat(xStr);
          const y = parseFloat(yStr);
          const z = parseFloat(zStr);
          const w = wStr !== undefined ? parseFloat(wStr) : 0;

          if (!isNaN(x) && !isNaN(y) && !isNaN(z) && !isNaN(w)) {
            if (instance && entitiesMap.size > 0) {
              console.log(`🔄 Moving entity ${name} and children to [${x}, ${y}, ${z}] with rotation ${w}`);
              await rotateHierarchy(name, [x, y, z, w], entitiesMap);
            } else {
              const alreadyQueued = messageQueue.current.some(
                (msg) =>
                  msg.name === name &&
                  JSON.stringify(msg.location) === JSON.stringify([x, y, z, w])
              );
              if (!alreadyQueued) {
                messageQueue.current.push({ name, location: [x, y, z, w] });
                setFlushTrigger((prev) => prev + 1);
              }
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
      const toProcess = messageQueue.current.splice(0, messageQueue.current.length);

      toProcess.forEach(async (parsed) => {
        const [x, y, z, w = 0] = parsed.location.map(Number);
        console.log(`🔄 Processing queued message for ${parsed.name} -> [${x}, ${y}, ${z}] with rotation ${w}`);
        await rotateHierarchy(parsed.name, [x, y, z, w], entitiesMap);
      });
    }
  }, [flushTrigger, instance, entitiesMap]);

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