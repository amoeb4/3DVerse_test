import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8767"); // mettre l'URL de ton WebSocket réel

ws.on("open", () => {
  console.log("Connected to bridge");
});

ws.on("message", (msg) => {
  console.log("Received:", msg.toString());
});