const { MongoClient } = require("mongodb");
const url = process.env.MONGO_URL || "mongodb://localhost:27017";

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
