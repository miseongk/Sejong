const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../../utils/middleware");
const { setDateTZ } = require("../../utils/utils");

// Set profile(gender, bio)
router.put("/profile/:student_id", middleware._auth, async (req, res) => {
  let query_response = {};

  const gender = req.body.gender;
  const bio = req.body.bio;

  if (gender.length == 0 || bio.length == 0) {
    res.status(400);
    query_response.message = "There are empty requests.";
    return res.send(query_response);
  }

  try {
    await _query(
      `UPDATE User SET gender = '${gender}', bio = '${bio}' WHERE student_id = ${req.params.student_id};`
    );
    query_response.message = `Set ${req.params.student_id}'s profile successfully.`;
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to set ${req.params.student_id}'s profile.`;
  }

  res.send(query_response);
});

// Get profile
router.get("/profile/:student_id", middleware._auth, async (req, res) => {
  let query_response = {};

  try {
    const profile = await _query(
      `SELECT student_id, name, major, gender, bio, reputation FROM User WHERE student_id = ${req.params.student_id};`
    );
    if (profile.length == 0) {
      res.status(400);
      query_response.message = `Student ID : '${req.params.student_id}' doesn't exist.`;
      return res.send(query_response);
    }
    query_response.data = profile;
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to get ${req.params.student_id}'s profile.`;
  }

  res.send(query_response);
});

// Get a specific user's posts
router.get("/profile/:student_id/posts", middleware._auth, async (req, res) => {
  let query_response = {};

  const student = await _query(
    `SELECT * FROM User WHERE student_id = ${req.params.student_id};`
  );
  if (student.length == 0) {
    res.status(400);
    query_response.message = `Student ID : '${req.params.student_id}' doesn't exist.`;
    return res.send(query_response);
  }
  try {
    const posts = await _query(
      `SELECT * FROM Post WHERE student_id = ${req.params.student_id} ORDER BY updated_at desc;`
    );
    for (let i = 0; i < posts.length; i++) {
      posts[i].start_date = setDateTZ(posts[i].start_date);
      posts[i].end_date = setDateTZ(posts[i].end_date);
    }
    query_response.data = posts;
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to get ${req.params.student_id}'s posts.`;
  }

  res.send(query_response);
});

// Get a specific user's reviews
router.get(
  "/profile/:student_id/reviews",
  middleware._auth,
  async (req, res) => {
    let query_response = {};
    let review = {};
    const student_id = req.params.student_id;
    try {
      const mentor_reviews = await _query(
        `SELECT id, review_num, count(review_num) as cnt FROM Review 
          WHERE student_id = ${student_id} AND review_num <10
            GROUP BY review_num ORDER BY cnt desc LIMIT 0,3;`
      );
      const mentee_reviews = await _query(
        `SELECT id, review_num, count(review_num) as cnt FROM Review
          WHERE student_id = ${student_id} AND review_num >10
            GROUP BY review_num ORDER BY cnt desc LIMIT 0,3;`
      );
      review.mentor = mentor_reviews;
      review.mentee = mentee_reviews;
      query_response.data = review;
    } catch (error) {
      res.status(400);
      query_response.message = `Failed to get ${req.params.student_id}'s reviews.`;
    }

    res.send(query_response);
  }
);

// Set bio
router.put("/profile/:student_id/bio", middleware._auth, async (req, res) => {
  let query_response = {};

  const bio = req.body.bio;

  try {
    const student = await _query(
      `SELECT * FROM User WHERE student_id = ${req.params.student_id};`
    );
    if (student.length == 0) {
      res.status(400);
      query_response.message = `Student ID: '${req.params.student_id}' doesn't exist.`;
      return res.send(query_response);
    }
    await _query(
      `UPDATE User SET bio = '${bio}' WHERE student_id = ${req.params.student_id};`
    );
    query_response.message = `Set ${req.params.student_id}'s bio successfully.`;
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to set ${req.params.student_id}'s bio.`;
  }

  res.send(query_response);
});

module.exports = router;
