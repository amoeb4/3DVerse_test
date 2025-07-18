import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8767 });

console.log('Server launched, awaiting message from client...');

wss.on('connection', (ws) => {
  console.log(`✅ Client connected (${wss.clients.size} total)`);

  ws.send("Hello from server");

  ws.on('message', (message) => {
    const text = message.toString();
    console.log("📨 Message received:", text);

    try {
      const data = JSON.parse(text);

      if (
        typeof data.name === "string" &&
        Array.isArray(data.location) &&
        data.location.length === 3 &&
        data.location.every((n) => typeof n === "number")
      ) {
        const entity = entities.find(e => e.name === data.name);
        if (entity) {
          entity.orientation = data.location;
          console.log(`🔄 Updated ${entity.name} to new location:`, data.location);
          ws.send(`Moved ${entity.name} to ${JSON.stringify(data.location)}`);
        } else {
          console.warn(`⚠️ Entity not found: ${data.name}`);
          ws.send(`Entity ${data.name} not found`);
        }
      } else {
        console.warn("⚠️ Invalid JSON format");
        ws.send("Invalid JSON format. Expected { name, location: [x,y,z] }");
      }
    } catch (err) {
      console.error("❌ Error parsing message:", err);
      ws.send("Error: Invalid JSON");
    }
  });

  ws.on('close', () => {
    console.log(`❌ Client disconnected (${wss.clients.size - 1} remaining)`);
  });
});
