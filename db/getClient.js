const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://Ziqing:fqhygi97ZKIOKnXS@photohub.gsh6i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

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
