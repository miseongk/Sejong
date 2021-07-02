const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../middleware/middleware");

// Match mentoring
router.post("/mentoring/:post_id", middleware._auth, async (req, res) => {
  let query_response = {};

  const post_id = req.params.post_id;
  const mentor_name = req.body.mentor;
  const mentee_name = req.body.mentee;
  const subject = req.body.subject;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const time = req.body.time;
  const day_arr = req.body.day;
  const day = day_arr.join(" ");

  try {
    const post = await _query(`SELECT * FROM Post WHERE id= ${post_id};`);
    if (post.length == 0) {
      res.status(400);
      query_response.message = `Post ID : '${post_id}' doesn't exist.`;
      return res.send(query_response);
    }
    if (post[0].is_matched == 1) {
      res.status(400);
      query_response.message = `Post ID : '${post_id}' has already matched.`;
      return res.send(query_response);
    }
    const mentor = await _query(
      `SELECT student_id FROM User WHERE name = '${mentor_name}';`
    );
    if (mentor.length == 0) {
      res.status(400);
      query_response.message = `Student : '${mentor_name}' doesn't exist.`;
      return res.send(query_response);
    }
    const mentee = await _query(
      `SELECT student_id FROM User WHERE name = '${mentee_name}';`
    );
    if (mentee.length == 0) {
      res.status(400);
      query_response.message = `Student : '${mentee_name}' doesn't exist.`;
      return res.send(query_response);
    }
    await _query(
      `INSERT INTO Mentoring (mentor, mentee, post_id, subject ,start_date, end_date, time, day) VALUES 
      (${mentor[0].student_id}, ${mentee[0].student_id}, ${post_id}, '${subject}', '${start_date}', '${end_date}', '${time}', '${day}');`
    );
    const mentoring = await _query(
      `SELECT * FROM Mentoring WHERE id IN (SELECT MAX(id) FROM Mentoring);`
    );
    await _query(`UPDATE Post SET is_matched = 1 WHERE id = ${post_id};`);

    query_response.data = mentoring;
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to match mentoring.";
  }

  res.send(query_response);
});

module.exports = router;
