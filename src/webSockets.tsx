import { useContext, useRef, useEffect, createContext, useCallback, useState } from "react";
import { useEntity, LivelinkContext } from "@3dverse/livelink-react";
import { usePartEntities } from "./partEntitiesContext"; // chemin selon ton arborescence
import { moveEntityAndChildren } from "./manipulationSkel"; // idem chemin

const WSContext = createContext({
  register: (_setTransform: any, _name: string) => () => {},
});

export function useWebSocket() {
  return useContext(WSContext);
}

export function WebSocketProvider({ children }) {
  const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
  const { entity: selectedEntity } = useEntity(selectedEntityName ? { name: selectedEntityName } : { name: "" });

  const { entitiesMap, entities } = usePartEntities(); // récupère map & instance ici
  const { instance } = useContext(LivelinkContext); // instance LiveLink

  const registry = useRef<{ setter: any; name: string }[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  const connectWebSocket = useCallback(() => {
    const socket = new WebSocket("ws://localhost:8767");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      reconnectAttempts.current = 0;

      if (selectedEntity?.name && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "select", name: selectedEntity.name }));
      }
    };

    socket.onmessage = async (event) => {
      console.log("📨 Message received:", event.data);

      try {
        const data = JSON.parse(event.data);
        if (!data?.name) {
          console.warn("⚠️ Message without 'name' field:", data);
          return;
        }

        if (data.action === "select") {
          setSelectedEntityName(data.name);
          return;
        }

        const entry = registry.current.find((e) => e.name === data.name);
        if (!entry) {
          console.warn(`⚠️ Entity not registered: ${data.name}`);
          return;
        }

        const transform: any = {};
        if (data.mode === "-P" && data.location) {
          transform.position = data.location;
        } else if (data.mode === "-A" && data.rotation) {
          transform.rotation = data.rotation;
        } else {
          console.warn("⚠️ Unknown mode or missing data:", data);
        }

        entry.setter((prev: any) => ({ ...prev, ...transform }));

      } catch {
        const msg = event.data.trim();
        const parts = msg.split(" ");
        if (parts.length === 4) {
          const [name, xStr, yStr, zStr] = parts;
          const x = parseFloat(xStr);
          const y = parseFloat(yStr);
          const z = parseFloat(zStr);

          if (name.startsWith("part_") && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
            if (instance && entitiesMap.size > 0) {
              console.log(`🔄 Moving entity ${name} and children by [${x}, ${y}, ${z}]`);
              await moveEntityAndChildren(name, [x, y, z], entitiesMap, instance);
            } else {
              console.warn("⚠️ instance or entitiesMap not ready yet");
            }
            return;
          }
        }
        console.error("❌ Unrecognized WebSocket message format:", event.data);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
      const timeout = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current === 5) {
        console.log("Too many connection attempts, aborting.");
        return;
      }
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectWebSocket();
      }, timeout);
      console.log(`🔄 Reconnecting in ${timeout}ms...`);
    };
  }, [selectedEntity?.name, instance, entitiesMap]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (selectedEntity?.name && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "select", name: selectedEntity.name }));
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

  return <WSContext.Provider value={{ register }}>{children}</WSContext.Provider>;
}

