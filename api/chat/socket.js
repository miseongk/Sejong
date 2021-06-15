const express = require("express");
const moment = require("moment");

const _query = require("../../database/db");
const { findRoom } = require("./utils");

module.exports = (app, io) => {
  io.on("connection", (socket) => {
    console.log("user connected: ", socket.id);

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
};
