import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8767 });

const entities = [
  { name: "Cone", position: [0, 0, 0], rotation: [0, 0, 0] },
  { name: "Cube", position: [5, 5, 5], rotation: [0, 0, 0] }
];

function sendEntityUpdates() {
  entities.forEach((entity) => {
    entity.position = entity.position.map(coord => coord + (Math.random() - 0.5));

    const message = JSON.stringify({
      name: entity.name,
      mode: "-P",
      location: entity.position
    });

    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  });
}

wss.on('connection', function connection(ws) {
  console.log('✅ Client connected');

  ws.send(JSON.stringify({ message: 'Hello from server' }));

  ws.on('message', function incoming(message) {
    console.log('📥 Received from client:', message.toString());
  });
});

setInterval(sendEntityUpdates, 10000);