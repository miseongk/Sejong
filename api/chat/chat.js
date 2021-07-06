const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../../utils/middleware");
const { findRoom } = require("./utils");

function date_descending(a, b) {
  const dateA = new Date(a["time"]).getTime();
  const dateB = new Date(b["time"]).getTime();
  return dateA < dateB ? 1 : -1;
}

// Get chatting lists
router.get("/chat", middleware._auth, async (req, res) => {
  let query_response = {};

  const user = res.locals.student_id;
  const page = req.query.page - 1;
  const limit = 10;

  try {
    let chatRoom = await _query(
      `SELECT room_id, user1, user2 FROM ChatRoom WHERE user1=${user} OR user2=${user}
      LIMIT ${page * limit}, ${limit};`
    );
    if (chatRoom.length == 0) {
      query_response.message = `User: ${user} doesn't have any chatting rooms.`;
      return res.send(query_response);
    }
    for (let i = 0; i < chatRoom.length; i++) {
      const chatList = await _query(
        `SELECT content, time FROM Chat WHERE room_id=${chatRoom[i].room_id}
          ORDER BY time desc LIMIT 0,1;`
      );
      if (chatList.length == 0) {
        chatRoom.splice(i, 1);
        i--;
        continue;
      } else {
        const user1_name = await _query(
          `SELECT name FROM User WHERE student_id = ${chatRoom[i].user1};`
        );
        const user2_name = await _query(
          `SELECT name FROM User WHERE student_id = ${chatRoom[i].user2};`
        );
        const is_matched = await _query(
          `SELECT is_matched FROM Post WHERE id IN (SELECT post FROM ChatRoom WHERE room_id=${chatRoom[i].room_id});`
        );
        chatRoom[i].user1_name = user1_name[0].name;
        chatRoom[i].user2_name = user2_name[0].name;
        chatRoom[i].msg = chatList[0].content;
        chatRoom[i].time = chatList[0].time;
        chatRoom[i].is_matched = is_matched[0].is_matched;
        // role, subject, content
        const post_info = await _query(
          `SELECT id, student_id, name, role, subject, content FROM Post WHERE id IN (SELECT post FROM ChatRoom WHERE room_id=${chatRoom[i].room_id});`
        );
        chatRoom[i].post_id = post_info[0].id;
        chatRoom[i].post_student_id = post_info[0].student_id;
        chatRoom[i].post_name = post_info[0].name;
        if (post_info[0].role == 1) {
          chatRoom[i].role = "멘토";
        } else {
          chatRoom[i].role = "멘티";
        }
        chatRoom[i].subject = post_info[0].subject;
        chatRoom[i].content = post_info[0].content;
        let user_name = "";
        if (chatRoom[i].user1 == user) {
          user_name = await _query(
            `SELECT name FROM User WHERE student_id = ${chatRoom[i].user2};`
          );
        } else {
          user_name = await _query(
            `SELECT name FROM User WHERE student_id = ${chatRoom[i].user1};`
          );
        }
        chatRoom[i].room_name = user_name[0].name;
      }
    }
    query_response.data = chatRoom.sort(date_descending);
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to get chatting lists.";
    console.log(error);
  }

  res.send(query_response);
});

// Get messages
router.get("/chat/:post_id/:student_id", middleware._auth, async (req, res) => {
  let query_response = {};

  const page = req.query.page - 1;
  const limit = 10;
  const user1 = res.locals.student_id;
  const user2 = req.params.student_id;
  const post = req.params.post_id;
  const room = await findRoom(user1, user2, post);
  const room_id = room[0].room_id;

  try {
    query_response.data = await _query(
      `SELECT id, sender, content, time, is_checked FROM Chat WHERE room_id=${room_id} 
      LIMIT ${page * limit}, ${limit};`
    );
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to get messages.";
  }

  res.send(query_response);
});

module.exports = router;
