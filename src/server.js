import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8767 });

console.log('Server launched, awaiting message from client...');

wss.on('connection', (ws) => {
  console.log(`✅ Client connected (${wss.clients.size} total)`);
  
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
      console.log(`➡️ Request to move ${data.name} to ${data.location}`);
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(data));
          console.log(text);
        }
      });
    } else if (typeof data.select === "string") {
      console.log(`🎯 Request to select entity: ${data.select}`);
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ select: data.select }));
        }
      });
    } else {
      ws.send("Invalid message format");
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
