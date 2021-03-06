const express = require("express");
const router = express.Router();

const findDocuments = require("../db/findDocuments");
const insertDocuments = require("../db/insertDocument");
const updateDocuments = require("../db/updateDocuments");

const getClient = require("../db/getClient");
let client;

// router.post("/find", async (req, res) => {
//   try {
//     client = await getClient();
//     console.log("finding");
//     const document = await findDocuments(client, "Users", req.body);
//     res.send({ results: document });
//   } catch (e) {
//     console.log("Error ", e);
//     res.status(400).send({ err: e });
//   } finally {
//     client.close();
//     console.log("Connection closed.");
//   }
// });

router.post("/signup", async (req, res) => {
  try {
    client = await getClient();
    console.log("Signing up");
    const data = {
      user_name: req.body.user_name,
      password: req.body.password,
      description: "",
      profile_photo: "images/profile-photo/default.jpg",
    };
    const result = await findDocuments(client, "Users", {
      user_name: data.user_name,
    });
    if (result !== {}) {
      // TODO use correct code
      res.status(400).send({ err: "User exists" });
    } else {
      await insertDocuments(client, "Users", data);
      res.redirect("/");
    }
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.post("/login", async (req, res) => {
  try {
    client = await getClient();
    console.log("Logging in");
    const query = {
      user_name: req.body.user_name,
      password: req.body.password,
    };
    console.log(query);
    const result = await findDocuments(client, "Users", query);
    if (result.length === 0) {
      // TODO use correct code
      console.log("not found");
      res.status(400).send({ err: "Incorrect user name or password." });
    } else {
      // TODO
      console.log("found");
      res.cookie("user_name", result[0].user_name, {
        maxAge: 86400000, // 1 day
      });
      res.redirect("/");
    }
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.get("/get-user", async (req, res) => {
  try {
    client = await getClient();
    const query = { user_name: req.cookies.user_name };
    const users = await findDocuments(client, "Users", query);
    if (users.length === 0) {
      res.status(404).send({ err: "User not found" });
    } else {
      const user = users[0];
      delete user.password;
      res.send(user);
    }
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.post("/update-description", async (req, res) => {
  try {
    client = await getClient();
    console.log("Updating description");
    await updateDocuments(
      client,
      "Users",
      { user_name: "Alice" },
      { $set: { description: req.body.description } }
    );
    res.redirect("/");
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed");
  }
});

router.post("/update-profile-photo", async (req, res) => {
  let file, filename, filepath;

  if (!req.files.profile_photo) {
    return res.status(400).send("No files were uploaded.");
  }
  file = req.files.profile_photo;

  try {
    client = await getClient();
    console.log("Inserting new document");
    // TODO use user's name
    filename = "Alice" + ".jpg";
    filepath = __dirname + "/../public/images/profile-photo/" + filename;
    const data = {
      profile_photo: "images/profile-photo/" + filename,
    };
    await updateDocuments(
      client,
      "Users",
      // TODO
      { user_name: "Alice" },
      { $set: data }
    );
    await file.mv(filepath);
    res.redirect("/");
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed");
  }
});
module.exports = router;
