import express from "express";
import path from "path";

import { Server } from "socket.io";
const PORT = process.env.PORT || 8080;

const app = express();
const server = app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});

let users = {};
const io = new Server(server);
io.on("connection", (socket) => {
  users[socket.id] = {
    idSocket: socket.id,
    id: Date.now(),
    position: { x: 0, y: 0 },
  };

  io.emit("server:userCreate", users[socket.id].id);
  socket.on("client:position", (data) => {
    users[socket.id].position.x = data.x;
    users[socket.id].position.y = data.y;

    io.emit("server:userPosition", users);
    console.log(data);
  });

  socket.on("disconnect", () => {
    io.emit("server:userDestroy", users[socket.id].id);
    console.log("client is disconnect", users[socket.id].id);
    delete users[socket.id];
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});
