const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");

const findDocuments = require("../db/findDocuments");
const insertDocuments = require("../db/insertDocument");
const updateDocuments = require("../db/updateDocuments");
const deleteDocuments = require("../db/deleteDocuments");

const getClient = require("../db/getClient");
let client;

const imageType = require("image-type");

router.get("/images", async (req, res) => {
  try {
    client = await getClient();
    console.log("Looking up images");
    const document = await findDocuments(client, "Images", {});
    res.send({ images: document });
  } catch (err) {
    console.log("Error ", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

router.post("/upload-image", async (req, res) => {
  if (req.cookies.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  let file, filename, filepath;
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  file = req.files.image;
  const image_type = imageType(file.data);
  // Incompatible file type
  if (image_type === null) {
    return res
      .status(415)
      .send("Unsupported Media Type.\nPlease upload an image.");
  }
  // Create a document in the database
  try {
    client = await getClient();
    console.log("Uploading new image");
    const id = await insertDocuments(client, "Images", {});
    // the filename will be decided by random id
    filename = id + "." + image_type.ext;
    filepath = __dirname + "/../public/images/" + filename;
    const data = {
      image_name: filename,
      username: req.cookies.username,
      url: "images/" + filename,
      number_liked: 0,
      comments: {},
    };
    await updateDocuments(
      client,
      "Images",
      { _id: ObjectId(id) },
      { $set: data }
    );
    file = await sharp(file.data);
    file = await file.resize(1000);
    await file.toFile(filepath, (err) => {
      if (err) res.status(400).send(err.name + ": " + err.message);
      else res.sendStatus(200);
    });
  } catch (err) {
    console.log("Error ", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

router.post("/add-comment", async (req, res) => {
  if (req.cookies.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  try {
    client = await getClient();
    console.log("Posting a comment");

    const comment_body = req.body.comment;
    //console.log(commentbody);

    // access img.comments. {$set {key(username): new value()}}
    const image_document = await findDocuments(client, "Images", {
      image_name: req.body.image_name,
    });
    // console.log("image_document" + image_document[0]);
    // console.log(image_document[0].comments);

    const usr = req.cookies.username.value;
    console.log(usr);

    await updateDocuments(client, "Images", image_document[0], {
      $set: { [usr]: comment_body },
    });

    // await updateDocuments(client, "Images", image_document[0], {
    //   $set: {
    //     "comments.username": req.cookies.username,
    //     "comments.commentText": comment_body,
    //   },
    // });

    console.log("After updating comments\n" + image_document[0].comments);

    res.sendStatus(200);
  } catch (err) {
    console.log("Error ", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

router.get("/view-comment", async (req, res) => {
  try {
    client = await getClient();
    const comment = await findDocuments(client, "comments-collection", {});
    res.send(comment);
  } catch (err) {
    console.log("Error ", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

router.delete("/delete-image", async (req, res) => {
  if (req.cookies.username === undefined) {
    return res.status(401).send("Please log in first.");
  }
  const url = req.body;
  try {
    client = await getClient();
    const user = await findDocuments(client, "Images", url);
    if (user[0].username !== req.cookies.username) {
      return res.status(401).send("Cannot delete other's photo.");
    }
    await deleteDocuments(client, "Images", url);
    const filepath = __dirname + "/../public/" + url.url;
    fs.unlink(filepath, (err) => {
      if (err) res.status(400).send(err.name + ": " + err.message);
      else res.sendStatus(200);
    });
  } catch (err) {
    console.log("Error ", err);
    res.status(400).send(err.name + ": " + err.message);
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

module.exports = router;
