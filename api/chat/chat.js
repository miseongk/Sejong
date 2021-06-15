const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../middleware/middleware");
const { findRoom } = require("./utils");

//Get chatting lists
router.get("/chat", middleware._auth, async (req, res) => {
  let query_response = {};

  const user = res.locals.student_id;
  //const page = req.query.page - 1;
  //const limit = 10;
  //select content, time from chat where room_id in (select room_id from chatroom where user1=18000000 or user2=18000000) order by time desc limit 0,1;
  let chatRoom = await _query(
    `SELECT room_id, user1, user2 FROM ChatRoom WHERE user1=${user} OR user2=${user};`
  );
  if (chatRoom.length == 0) {
    query_response.message = `User: ${user} doesn't have any chatting rooms`;
    return res.send(query_response);
  }
  //user, content, time
  for (let i = 0; i < chatRoom.length; i++) {
    const chatList = await _query(
      `SELECT content, time FROM Chat WHERE room_id=${chatRoom[i].room_id}
          ORDER BY time desc LIMIT 0,1;`
    );
    chatRoom[i].content = chatList[0].content;
    chatRoom[i].time = chatList[0].time;
    if (chatRoom[i].user1 == user) {
      chatRoom[i].room = chatRoom[i].user2;
    } else {
      chatRoom[i].room_name = chatRoom[i].user1;
    }
  }
  query_response.data = chatRoom;
  res.send(query_response);
});

//Get messages
router.get("/chat/:room_name", middleware._auth, async (req, res) => {
  let query_response = {};

  const page = req.query.page - 1;
  const limit = 10;
  const user = res.locals.student_id;
  const room_name = req.params.room_name;
  const room_id = await findRoom(user, room_name);

  query_response.data = await _query(
    `SELECT id, sender, content, time, is_checked FROM Chat WHERE room_id=${room_id} 
    ORDER BY time desc LIMIT ${page * limit}, ${limit};`
  );

  res.send(query_response);
});

module.exports = router;
