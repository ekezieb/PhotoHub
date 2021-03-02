const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const port = 8080;

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

app.listen(port);

const data = [{ url: "https://www.google.com" }];

app.get("/", (req, res) => {
  res("index.html");
});

app.get("/image", (req, res) => {
  res.json({ image: data });
});
