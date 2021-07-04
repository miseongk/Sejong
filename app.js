const express = require("express");
const app = express();
//const http = require("http");
//const server = http.createServer(app);
const socketio = require("socket.io");
//const io = socketio(server);
const bodyparser = require("body-parser");
const cors = require("cors");

const API_PORT = process.env.API_PORT || 3000;
const API_HOST = process.env.API_HOST || "localhost";
const API_ROOT = "/api/v1/";

const auth = require("./api/user/auth");
const post = require("./api/post/post");
const profile = require("./api/user/profile");
const chat = require("./api/chat/chat");
const mentoring = require("./api/mentoring/mentoring");
const search = require("./api/search/search");
const middleware = require("./utils/middleware");
const _query = require("./database/db");
const { findRoom } = require("./api/chat/utils");
const moment = require("moment");

const server = app.listen(API_PORT, API_HOST, () => {
  console.log(
    `Sejong Mentoring System running at http://${API_HOST}:${API_PORT}`
  );
});

const io = socketio(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware._log);
app.use(cors());

app.use(API_ROOT, auth);
app.use(API_ROOT, post);
app.use(API_ROOT, profile);
app.use(API_ROOT, chat);
app.use(API_ROOT, mentoring);
app.use(API_ROOT, search);

// io.on("connection", (socket) => {
//   console.log("user connected: ", socket.id);
// });
// io.emit("channel2", "new channel");
// io.on("channel2", (obj) => {
//   console.log("Object from RN app", obj);
// });

//require("./api/chat/socket")(app, io);

io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);

  socket.on("joinRoom", async ({ user1, user2, post }) => {
    let room = await findRoom(user1, user2, post);
    let room_id = 0;
    if (room.length == 0) {
      await _query(
        `INSERT INTO ChatRoom (user1, user2 , post) VALUES (${user1},${user2}, ${post});`
      );
      room = await findRoom(user1, user2, post);
      room_id = room[0].room_id;
    } else {
      room = room[0].room_id;
    }
    socket.join(room);
    console.log("Join Room!");
  });

  socket.on("chatMessage", async ({ msg, sender, receiver, post }) => {
    const room = await findRoom(sender, receiver, post);
    const room_id = room[0].room_id;
    await _query(
      `INSERT INTO Chat (room_id, sender, content) VALUES (${room_id}, ${sender}, '${msg}');`
    );
    io.to(room).emit("message", { sender, msg, time: moment() });
    console.log("Send Message!");
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });
});
