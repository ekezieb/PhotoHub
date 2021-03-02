const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const port = 3000;

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
  res.json(data);
});

// MongoDB sample code (still questionable)
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://Ziqing:pZlJx6Pq4YkO8Q8t@photohub.gsh6i.mongodb.net/PhotoHub?retryWrites=true&w=majority";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("sample_mflix");
    const movies = database.collection("movies");
    // Query for a movie that has the title 'Back to the Future'
    const query = { title: "Back to the Future" };
    const movie = await movies.findOne(query);
    console.log("movie: ", movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
