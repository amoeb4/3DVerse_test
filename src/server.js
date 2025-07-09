import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8767 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('received:', message.toString());
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.send(JSON.stringify({ message: 'Hello from server' }));
});