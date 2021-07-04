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

// Get mentoring list
router.get("/mentoring", middleware._auth, async (req, res) => {
  let query_response = {};

  const user = res.locals.student_id;
  const page = req.query.page - 1;
  const limit = 10;

  try {
    const mentoring = await _query(
      `SELECT id, mentor, mentee, subject, start_date, end_date, time, day FROM Mentoring WHERE mentor = ${user} OR mentee = ${user} AND is_reviewed = 0 
      ORDER BY created_at desc LIMIT ${page * limit}, ${limit};`
    );
    const today = new Date();
    for (let i = 0; i < mentoring.length; i++) {
      const mentor_name = await _query(
        `SELECT name FROM User WHERE student_id = ${mentoring[i].mentor};`
      );
      const mentee_name = await _query(
        `SELECT name FROM User WHERE student_id = ${mentoring[i].mentee};`
      );
      mentoring[i].mentor = mentor_name[0].name;
      mentoring[i].mentee = mentee_name[0].name;
      if (mentoring[i].end_date < today) {
        mentoring[i].end = 1;
      } else {
        mentoring[i].end = 0;
      }
    }
    query_response.data = mentoring;
  } catch (error) {
    res.status(400);
    query_response.message = "Failed to get mentoring list.";
  }

  res.send(query_response);
});

// Write a mentoring record
router.post(
  "/mentoring/record/:mentoring_id",
  middleware._auth,
  async (req, res) => {
    let query_response = {};

    const date = req.body.date;
    const content = req.body.content;
    const mentoring_id = await _query(
      `SELECT id FROM Mentoring WHERE id = ${req.params.mentoring_id};`
    );

    if (mentoring_id.length == 0) {
      res.status(400);
      query_response.message = `Mentoring ID: '${req.params.mentoring_id}' doesn't exist.`;
      return res.send(query_response);
    }

    try {
      await _query(
        `INSERT INTO Record (date, content) VALUES ('${date}' , '${content}');`
      );
      const record = await _query(
        `SELECT * FROM Record WHERE id IN (SELECT MAX(id) FROM Record);`
      );
      await _query(
        `INSERT INTO Mentoring_Record (mentoring_id, record_id) VALUES (${mentoring_id[0].id}, ${record[0].id});`
      );
      query_response.data = record;
    } catch (error) {
      res.status(400);
      query_response.message = "Failed to post a mentoring record.";
    }

    res.send(query_response);
  }
);

// Update a record
router.put(
  "/mentoring/record/:record_id",
  middleware._auth,
  async (req, res) => {
    let query_response = {};

    const date = req.body.date;
    const content = req.body.content;
    const record_id = await _query(
      `SELECT id FROM Record WHERE id = ${req.params.record_id};`
    );

    if (record_id.length == 0) {
      res.status(400);
      query_response.message = `Record ID: '${req.params.record_id}' doesn't exist.`;
      return res.send(query_response);
    }

    try {
      await _query(
        `UPDATE Record SET date = '${date}', content = '${content}' WHERE id = ${record_id[0].id};`
      );
      query_response.message = `Record ID: '${record_id[0].id}' has been updated successfully.`;
    } catch (error) {
      res.status(400);
      query_response.message = "Failed to update a record.";
    }

    res.send(query_response);
  }
);

module.exports = router;
