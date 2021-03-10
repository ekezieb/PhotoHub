const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const fs = require("fs");

const findDocuments = require("../db/findDocuments");
const insertDocuments = require("../db/insertDocument");
const updateDocuments = require("../db/updateDocuments");

const client = require("../db/getClient").getClient();

const imageType = require("image-type");

router.post("/signup", async (req, res) => {
  if (req.body.username === "" || req.body.password === "") {
    return res.status(400).send("Username or password cannot be empty.");
  }
  try {
    console.log("Signing up");
    const data = {
      username: req.body.username,
      password: req.body.password,
      biography: "lifestyle",
      profile_photo: "images/profile-photo/default.jpg",
    };
    const result = await findDocuments(client, "Users", {
      username: data.username,
    });
    if (result.length !== 0) {
      res.status(400).send("User exists.");
    } else {
      await insertDocuments(client, "Users", data);
      res.sendStatus(201);
    }
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  }
});

router.post("/login", async (req, res) => {
  if (req.session.username !== undefined) {
    return res.status(400).send("Already logged in.");
  }
  try {
    console.log("Logging in");
    const query = {
      username: req.body.username,
      password: req.body.password,
    };
    console.log(query);
    const result = await findDocuments(client, "Users", query);
    if (result.length === 0) {
      res.status(404).send("Please provide a valid username and password.");
    } else {
      const user = result[0];
      req.session.username = user.username;
      req.session.profile_photo = user.profile_photo;
      req.session.biography = user.biography;
      console.log("record session", req.session);
      res.sendStatus(200);
    }
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  }
});

router.get("/get-user", async (req, res) => {
  console.log("session", req.session);
  if (req.session.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  const user = {
    username: req.session.username,
    profile_photo: req.session.profile_photo,
    biography: req.session.biography,
  };
  res.send(user);
});

router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  });
  res.sendStatus(200);
});

router.get("/get-all-users", async (req, res) => {
  try {
    const { performance } = require("perf_hooks");
    const t1 = performance.now();
    const users = await findDocuments(client, "Users", {});
    const t2 = performance.now();
    console.log("findDocuments", t2 - t1);
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      for (let user of users) {
        delete user.password;
        delete user._id;
      }
      res.send(users);
    }
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  }
});

router.put("/update-bio", async (req, res) => {
  if (req.session.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  try {
    console.log("Updating biography");
    await updateDocuments(
      client,
      "Users",
      { username: req.session.username },
      { $set: { biography: req.body.biography } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  }
});

router.put("/update-profile-photo", async (req, res) => {
  if (req.session.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  let file, filename, filepath;
  let username = req.session.username;
  if (!req.files.profile_photo) {
    return res.status(400).send("No files were uploaded.");
  }
  file = req.files.profile_photo;
  const image_type = imageType(file.data);
  if (image_type == null) {
    return res
      .status(415)
      .send("Unsupported Media Type.\nPlease upload an image.");
  }
  try {
    console.log("Updating profile photo of", username);
    filename = username + "." + image_type.ext;
    filepath = __dirname + "/../public/images/profile-photo/" + filename;
    const data = {
      profile_photo: "images/profile-photo/" + filename,
    };
    // remove previous profile photo if not default
    const user = await findDocuments(client, "Users", { username: username });
    if (user[0].profile_photo !== "images/profile-photo/default.jpg") {
      const pre_profile_photo =
        __dirname + "/../public/" + user[0].profile_photo;
      fs.unlink(pre_profile_photo, (err) => {
        if (err) res.status(400).send(err.name + ": " + err.message);
      });
    }
    // update
    await updateDocuments(
      client,
      "Users",
      { username: username },
      { $set: data }
    );
    // move
    file = await sharp(file.data);
    file = await file.resize(200, 200);
    await file.toFile(filepath, (err) => {
      if (err) res.status(400).send(err.name + ": " + err.message);
      else res.sendStatus(200);
    });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});
module.exports = router;
