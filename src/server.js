import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8767 });

console.log('🚀 WebSocket Server started on ws://localhost:8767');

async function sendEntityUpdates() {
  entities.forEach((entity) => {
    entity.position = entity.orientation.map(coord => coord + (Math.random() - 0.5));
    const [x, y, z] = entity.position;
    const message = `${entity.name} ${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`;
    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  });
}

wss.on('connection', (ws) => {
  console.log(`✅ Client connected (${wss.clients.size} total)`);

  ws.send("Hello from server");

  ws.on('message', (message) => {
    console.log(`Client said: ${message.toString()}`);
  });

  ws.on('close', () => {
    console.log(`❌ Client disconnected (${wss.clients.size - 1} remaining)`);
  });
});
