const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const bodyparser = require("body-parser");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

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

app.use(API_ROOT, auth);
app.use(API_ROOT, post);
app.use(API_ROOT, profile);
app.use(API_ROOT, chat);
app.use(API_ROOT, search);

require("./api/chat/socket")(app, io);

app.listen(API_PORT, API_HOST, () => {
  console.log(
    `Sejong Mentoring System running at http://${API_HOST}:${API_PORT}`
  );
});
