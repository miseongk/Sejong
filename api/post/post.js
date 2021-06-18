const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../middleware/middleware");

// Create a post
router.post("/post", middleware._auth, async (req, res) => {
  let query_response = {};

  const writer = res.locals.student_id;
  const role = req.body.role;
  const subject = req.body.subject;
  const level = req.body.level;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const time = req.body.time;
  const day = req.body.day;
  const content = req.body.content;

  try {
    await _query(
      `INSERT INTO Post (student_id, role, subject, level, start_date, end_date, time, day, content)
            VALUES (${writer}, '${role}', '${subject}', '${level}', '${start_date}','${end_date}', '${time}', '${day}', '${content}');`
    );

    query_response.data = req.body;
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to upload a post.";
  }

  res.send(query_response);
});

// Get a detail page of a post
router.get("/post/:post_id", middleware._auth, async (req, res) => {
  let query_response = {};

  const post_id = req.params.post_id;
  try {
    const post = await _query(`SELECT * FROM Post WHERE id = ${post_id};`);
    if (post.length === 0) {
      res.status(400);
      query_response.message = `Post id '${post_id}' doesn't exist.`;
    } else {
      const name = await _query(
        `SELECT name FROM User WHERE student_id = ${post[0].student_id};`
      );
      query_response.data = post;
      query_response.data[0].name = name[0].name;
    }
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to get a post with post id '${post_id}'.`;
  }

  res.send(query_response);
});

module.exports = router;
