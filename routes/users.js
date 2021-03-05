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

router.post("/get-user", async (req, res) => {
  try {
    client = await getClient();
    console.log("Looking up an user");
    const query = req.body;
    const user = await findDocuments(client, "Users", query);
    res.send(user[0]);
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

module.exports = router;
