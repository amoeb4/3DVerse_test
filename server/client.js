import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
  console.log("connection established");
  socket.send("client connected");
});
socket.on("message", (data) => {
  console.log("message from server:", data.toString());
socket.on("close", ()=>
    socket.send("client disconnected");
    console.log("disconnected"));
});
