const express = require("express");
const router = express.Router();

const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");

const findDocuments = require("../db/findDocuments");
const insertDocuments = require("../db/insertDocument");
const updateDocuments = require("../db/updateDocuments");
const deleteDocuments = require("../db/deleteDocuments");

const getClient = require("../db/getClient");
let client;

router.get("/images", async (req, res) => {
  try {
    client = await getClient();
    console.log("Looking up images");
    const document = await findDocuments(client, "Images", {});
    res.send({ images: document });
  } catch (e) {
    console.log("Error ", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

router.post("/upload-image", async (req, res) => {
  let file, filename, filepath;

  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  file = req.files.image;

  // Create a document in the database
  try {
    client = await getClient();
    console.log("Inserting new document");
    const id = await insertDocuments(client, "Images", {});
    // the filename will be decided by random id
    filename = id + ".jpg";
    filepath = __dirname + "/../public/images/" + filename;
    const data = {
      image_name: filename,
      user_name: "Alice",
      url: "images/" + filename,
      number_liked: 0,
      comments: { 0: undefined, 1: undefined },
    };
    await updateDocuments(
      client,
      "Images",
      { _id: ObjectId(id) },
      { $set: data }
    );
    console.log("here");
    await file.mv(filepath);
    res.redirect("/");
  } catch (e) {
    console.log("Error ", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

router.post("/delete-image", async (req, res) => {
  const url = req.body;
  try {
    client = await getClient();
    await deleteDocuments(client, "Images", url);
    const filepath = __dirname + "/../public/" + url.url;
    fs.unlink(filepath, () => res.send({ status: true }));
  } catch (e) {
    console.log(e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

module.exports = router;
