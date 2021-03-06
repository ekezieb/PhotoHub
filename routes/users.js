const express = require("express");
const router = express.Router();

const fs = require("fs");

const findDocuments = require("../db/findDocuments");
const insertDocuments = require("../db/insertDocument");
const updateDocuments = require("../db/updateDocuments");

const getClient = require("../db/getClient");
let client;

const imageType = require("image-type");

router.post("/signup", async (req, res) => {
  if (req.body.username === "" || req.body.password === "") {
    return res.status(400).send("Username or password cannot be empty.");
  }
  try {
    client = await getClient();
    console.log("Signing up");
    const data = {
      username: req.body.username,
      password: req.body.password,
      biography: "",
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
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.post("/login", async (req, res) => {
  if (req.cookies.username !== undefined) {
    return res.status(400).send("Already logged in.");
  }
  try {
    client = await getClient();
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
      res.cookie("username", result[0].username, {
        maxAge: 86400000, // 1 day
      });
      res.sendStatus(200);
    }
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.get("/get-user", async (req, res) => {
  if (req.cookies.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  try {
    client = await getClient();
    const query = { username: req.cookies.username };
    const users = await findDocuments(client, "Users", query);
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      const user = users[0];
      delete user.password;
      delete user._id;
      res.send(user);
    }
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.put("/update-bio", async (req, res) => {
  if (req.cookies.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  try {
    client = await getClient();
    console.log("Updating biography");
    await updateDocuments(
      client,
      "Users",
      { username: req.cookies.username },
      { $set: { biography: req.body.biography } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log("Error", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.put("/update-profile-photo", async (req, res) => {
  if (req.cookies.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  let file, filename, filepath;
  let username = req.cookies.username;
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
    client = await getClient();
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
    await file.mv(filepath, (err) => {
      if (err) res.status(400).send(err.name + ": " + err.message);
      else res.sendStatus(200);
    });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed");
  }
});
module.exports = router;
