const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://Ziqing:fqhygi97ZKIOKnXS@photohub.gsh6i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

async function getClient() {
  try {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    console.log("Connecting to the database.");
    await client.connect();
    console.log("Connected.");
    return client;
  } catch (e) {
    console.log("Error ", e);
    throw e;
  }
}

module.exports = getClient;
