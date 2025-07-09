// websocket-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8767 });

wss.on('connection', function connection(ws) {
  console.log("✅ Client connecté");

  ws.on('message', function incoming(message) {
    console.log("📨 Message reçu :", message.toString());

    // Ici, tu pourrais parser et filtrer le message avant de le renvoyer à ton client React
    try {
      const data = JSON.parse(message);
      console.log("🔍 Données :", data);
      // Tu pourrais broadcast ici à plusieurs clients si besoin
    } catch (e) {
      console.error("❌ JSON invalide :", e);
    }
  });
});

console.log("🚀 Serveur WebSocket lancé sur ws://localhost:8767");
