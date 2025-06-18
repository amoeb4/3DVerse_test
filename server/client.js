import WebSocket from "ws";
import readline from "readline";
const socket = new WebSocket("ws://localhost:8081");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("open", () => {
  console.log("connection established");
  socket.send("client connected");
});
socket.on("message", (data) => {
  console.log("message from server:", data.toString());
socket.on("close", ()=>
    console.log("client disconnected"));
});
