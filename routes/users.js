const express = require("express");
const router = express.Router();

const findDocuments = require("../db/findDocuments");

const getClient = require("../db/getClient");
let client;

router.post("/find", async (req, res) => {
  try {
    client = await getClient();
    console.log("finding");
    const document = await findDocuments(client, "Users", req.body);
    res.send({ results: document });
  } catch (e) {
    console.log("Error ", e);
    res.status(400).send({ err: e });
  } finally {
    client.close();
    console.log("Connection closed.");
  }
});

module.exports = router;
