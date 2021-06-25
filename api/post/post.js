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
  const day_arr = req.body.day;
  const day = day_arr.join(" ");
  const content = req.body.content;

  try {
    const name = await _query(
      `SELECT name FROM User WHERE student_id = ${writer};`
    );
    await _query(
      `INSERT INTO Post (student_id, name, role, subject, level, start_date, end_date, time, day, content)
            VALUES (${writer}, '${name[0].name}', ${role}, '${subject}', '${level}', '${start_date}','${end_date}', '${time}', '${day}', '${content}');`
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
      query_response.data = post;
    }
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to get a post with post id '${post_id}'.`;
  }

  res.send(query_response);
});

// Get a list of posts
router.get("/post/:role/list", middleware._auth, async (req, res) => {
  let query_response = {};

  const params = req.params.role;
  const page = req.query.page - 1;
  const limit = 9;
  let role = 0;
  let posts = {};

  if (params === "mentee") {
    role = 2;
  } else if (params === "mentor") {
    role = 1;
  }

  try {
    if (role == 1 || role == 2) {
      posts = await _query(
        `SELECT id, name, subject, level, start_date, end_date, time, day, created_at FROM Post
      WHERE role = ${role} AND is_matched = 0 
      ORDER BY created_at desc LIMIT ${page * limit}, ${limit};`
      );
    } else {
      posts = await _query(
        `SELECT p.id, p.name, p.subject, p.level, p.start_date, p.end_date, p.time, p.day, p.created_at, u.reputation
        FROM Post as p JOIN User as u ON p.student_id = u.student_id AND p.role=1
        ORDER BY u.reputation desc LIMIT ${page * limit}, ${limit};`
      );
    }
    query_response.data = posts;
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to get a list of posts.";
  }

  res.send(query_response);
});

module.exports = router;
