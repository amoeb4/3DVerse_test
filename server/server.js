import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Message received:', message.toString());
  });
});

console.log('WebSocket server running on ws://localhost:8080');