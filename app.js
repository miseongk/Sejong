const express = require("express");
const bodyparser = require("body-parser");

const app = express();
const API_PORT = process.env.API_PORT || 3000;
const API_HOST = process.env.API_HOST || "localhost";
const API_ROOT = "/api/v1/";

const auth = require("./api/user/auth");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(API_ROOT, auth);

app.listen(API_PORT, API_HOST, () => {
  console.log(
    `Sejong Mentoring System running at http://${API_HOST}:${API_PORT}`
  );
});
