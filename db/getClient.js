const { MongoClient } = require("mongodb");
const url = process.env.MONGO_URL || "mongodb://localhost:27017";

let client;

module.exports = {
  connect: () => {
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the database.");
      client.connect().catch(console.log);
      console.log("Connected.");
      return client;
    } catch (e) {
      client.close().catch(console.log);
      console.log("Error ", e);
      throw e;
    }
  },
  getClient: () => client,
};
