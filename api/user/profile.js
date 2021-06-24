const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../middleware/middleware");

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

module.exports = router;
