const express = require("express");
const router = express.Router();

const _query = require("../../database/db");
const middleware = require("../../utils/middleware");

// Search users or posts
router.get("/search", middleware._auth, async (req, res) => {
  let query_response = {};

  const search = req.query.search;
  const page = req.query.page - 1;
  const limit = 9;

  try {
    const result = await _query(
      `SELECT * FROM Post WHERE name LIKE '%${search}%' OR subject LIKE '%${search}%'
      ORDER BY created_at desc LIMIT ${page * limit}, ${limit};`
    );
    if (result.length == 0) {
      query_response.message = "No data.";
    }
    query_response.data = result;
  } catch (error) {
    res.status(400);
    query_response.data = error;
  }
  res.send(query_response);
});

module.exports = router;
