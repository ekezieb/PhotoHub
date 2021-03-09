const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

const usersRouter = require("./routes/users");
const imagesRouter = require("./routes/images");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// , { maxAge: 86400000 }
app.use(fileUpload({}));

app.use("/", imagesRouter);
app.use("/", usersRouter);

app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;
