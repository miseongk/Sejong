const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const bodyparser = require("body-parser");
const cors = require("cors");

const API_PORT = process.env.API_PORT || 3000;
const API_HOST = process.env.API_HOST || "localhost";
const API_ROOT = "/api/v1/";

const auth = require("./api/user/auth");
const post = require("./api/post/post");
const profile = require("./api/user/profile");
const chat = require("./api/chat/chat");
const search = require("./api/search/search");
const middleware = require("./api/middleware/middleware");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(middleware._log);
app.use(cors());

app.use(API_ROOT, auth);
app.use(API_ROOT, post);
app.use(API_ROOT, profile);
app.use(API_ROOT, chat);
app.use(API_ROOT, search);

//require("./api/chat/socket")(app, io);

io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);
  //const user2 = res.locals.student_id;
  socket.on("joinRoom", async ({ user1, user2 }) => {
    const room = await findRoom(user1, user2);
    if (room.length == 0) {
      await _query(
        `INSERT INTO ChatRoom (user1, user2) VALUES (${user1},${user2});`
      );
      room = await findRoom(user1, user2);
    }
    socket.join(room);
  });
  socket.on("alert", (str) => {
    console.log(str);
  });

  socket.on("chatMessage", async ({ msg, sender, receiver }) => {
    const room = await findRoom(sender, receiver);
    await _query(
      `INSERT INTO Chat (room_id, sender, content) VALUES (${room}, ${sender}, '${msg}');`
    );
    io.to(room).emit("message", { sender, msg, time: moment() });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });
});

app.listen(API_PORT, API_HOST, () => {
  console.log(
    `Sejong Mentoring System running at http://${API_HOST}:${API_PORT}`
  );
});
