import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8767 });

console.log('🚀 WebSocket Server started on ws://localhost:8767');

const entities = Array.from({ length: 3 }, (_, i) => ({
  name: `part_${i + 1}`,
  position: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
}));

function sendEntityUpdates() {
  entities.forEach((entity) => {
    entity.position = entity.position.map(coord => coord + (Math.random() - 0.5));
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
  console.log('✅ Client connected');
  ws.send("Hello from server");

  ws.on('message', (message) => {
    console.log('📥 Received from client:', message.toString());
  });
});
setInterval(sendEntityUpdates, 10000);