const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../middleware/middleware");

// Set gender
router.put("/profile/:student_id", middleware._auth, async (req, res) => {
  let query_response = {};

  const gender = req.body.gender;

  try {
    await _query(
      `UPDATE User SET gender = '${gender}' WHERE student_id = ${req.params.student_id};`
    );
    query_response.message = `Set ${req.params.student_id}'s gender successfully.`;
  } catch (error) {
    res.status(400);
    query_response.message = `Failed to set ${req.params.student_id}'s gender.`;
  }

  res.send(query_response);
});

module.exports = router;
