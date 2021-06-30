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
    const post = await _query(
      `SELECT * FROM Post WHERE id IN (SELECT MAX(id) FROM Post);`
    );
    query_response.data = post;
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to upload a post.";
  }

  res.send(query_response);
});

// Update a post
router.put("/post/:post_id", middleware._auth, async (req, res) => {
  let query_response = {};

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
    const post = await _query(
      `SELECT * FROM Post WHERE id = ${req.params.post_id};`
    );
    if (post.length == 0) {
      res.status(400);
      query_response.message = `Post ID: '${req.params.post_id}' doesn't exist.`;
      return res.send(query_response);
    }
    await _query(
      `UPDATE Post SET role = ${role}, subject = '${subject}', level = '${level}', start_date = '${start_date}', end_date = '${end_date}',
       time = '${time}', day = '${day}', content = '${content}' WHERE id = ${req.params.post_id};`
    );
    query_response.message = `Post ID: '${req.params.post_id}' has been updated successfully.`;
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to update a post.";
  }

  res.send(query_response);
});

// Delete a post
router.delete("/post/:post_id", middleware._auth, async (req, res) => {
  let query_response = {};

  //const user = res.locals.student_id;
  const post = await _query(
    `SELECT * FROM Post WHERE id = ${req.params.post_id};`
  );

  if (post.length == 0) {
    res.status(400);
    query_response.message = `Post ID: '${req.params.post_id}' doesn't exist.`;
    return res.send(query_response);
  }
  try {
    await _query(`DELETE FROM Post WHERE id = ${req.params.post_id};`);
    query_response.message = `Post ID: '${req.params.post_id}' has been deleted successfully.`;
    // if (user === writer[0].student_id) {
    //   await _query(`DELETE FROM Post WHERE id = ${req.params.post_id};`);
    //   query_response.message = `Post ID: '${req.params.post_id}' has been deleted successfully.`;
    // } else {
    //   query_response.message = `Post ID: '${req.params.post_id}' is not ${user}'s post.`;
    // }
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to delete a post.";
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
        `SELECT * FROM Post WHERE role = ${role} AND is_matched = 0 
        ORDER BY created_at desc LIMIT ${page * limit}, ${limit};`
      );
    } else {
      posts = await _query(
        `SELECT p.*, u.reputation FROM Post as p JOIN User as u ON p.student_id = u.student_id AND p.role=1
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
