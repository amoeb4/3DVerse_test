import {
  useContext,
  useRef,
  useEffect,
  createContext,
  useCallback,
  useState,
} from "react";
import "./App.css";
import { useEntity } from "@3dverse/livelink-react";
//import { LivelinkContext } from "@3dverse/livelink-react";

const WSContext = createContext({
  register: (_setTransform: any, _name: string) => () => {},
});

export function useWebSocket() {
  return useContext(WSContext);
}

//function eulerToQuat(x: number, y: number, z: number): [number, number, number, number] {
//  const degToRad = (deg: number) => (deg * Math.PI) / 180;
//  const ex = degToRad(x);
//  const ey = degToRad(y);
//  const ez = degToRad(z);
//
//  const cy = Math.cos(ez * 0.5);
//  const sy = Math.sin(ez * 0.5);
//  const cp = Math.cos(ey * 0.5);
//  const sp = Math.sin(ey * 0.5);
//  const cr = Math.cos(ex * 0.5);
//  const sr = Math.sin(ex * 0.5);
//
//  return [
//    sr * cp * cy - cr * sp * sy,
//    cr * sp * cy + sr * cp * sy,
//    cr * cp * sy - sr * sp * cy,
//    cr * cp * cy + sr * sp * sy,
//  ];
//}

//export function EntitySync({ name }: { name: string }) {
//  const { register } = useWebSocket();
//  const livelink = useContext(LivelinkContext);
//  const [transform, setTransform] = useState({
//    position: [0, 0, 0],
//    rotation: [0, 0, 0],
//  });
//
//  useEffect(() => {
//    if (name) {
//      register(setTransform, name);
//      console.log("🧩 Registered entity:", name);
//    }
//  }, [name, register]);
//
//  useEffect(() => {
//    if (!livelink.instance) return;
//
//    //const applyTransform = async () => {
//      const [entity] = await livelink.instance.scene.findEntitiesByNames({ name });
//      if (!entity) {
//        console.warn(`⚠️ Entity "${name}" not found.`);
//        return;
//      }
//
//      console.log(`🎯 Applying transform to entity "${name}":`, transform);
//
//      const updates: any = {};
//
//      if (transform.position) {
//        updates.position = transform.position;
//      }
//
//      if (transform.rotation) {
//        updates.orientation = eulerToQuat(
//          transform.rotation[0],
//          transform.rotation[1],
//          transform.rotation[2]
//        );
//      }
//
//    livelink.instance.entities.setComponent(entity, "local_transform", updates);
//
//    };
//
//    applyTransform();
//  }, [transform, livelink, name]);
//
//  return null;
//}

export function WebSocketProvider({ children }) {
  const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
  const { entity: selectedEntity } = useEntity(selectedEntityName ? { name: selectedEntityName } : { name: "" });

  const registry = useRef<{ setter: any; name: string }[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  const connectWebSocket = useCallback(() => {
    const socket = new WebSocket("ws://localhost:8767");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      reconnectAttempts.current = 0; // reset attempts after successful connection

      if (selectedEntity?.name && socket.readyState === WebSocket.OPEN) {
        const msg = { action: "select", name: selectedEntity.name };
        socket.send(JSON.stringify(msg));
        console.log("📤 Sent selected entity to server:", msg);
      }
    };

    socket.onmessage = (event) => {
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
          console.log("📋 Current registry:", registry.current.map((e) => e.name));
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

        console.log(`🔁 Updating entity "${data.name}" with:`, transform);
        entry.setter((prev: any) => ({ ...prev, ...transform }));
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", event.data, err);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
      const timeout = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current == 5)
      {
        console.log("Too much connection attempts, something might be fishy");
        return ;
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, timeout);
      console.log(`🔄 Reconnecting in ${timeout}ms...`);
    };
  }, [selectedEntity?.name]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (selectedEntity?.name && socketRef.current?.readyState === WebSocket.OPEN) {
      const msg = { action: "select", name: selectedEntity.name };
      socketRef.current.send(JSON.stringify(msg));
      console.log("📤 Sent selected entity to server (on change):", msg);
    }
  }, [selectedEntity]);

  const register = useCallback((setter: any, name: string) => {
    // Pour éviter les doublons
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
