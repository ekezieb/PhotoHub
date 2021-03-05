async function insertDocuments(client, collection, data) {
  try {
    const _db = client.db("PhotoHub");
    const _collection = _db.collection(collection);
    console.log("Collection ready, inserting ", data);
    const res = await _collection.insertOne(data);
    const id = await res.insertedId;
    console.log("ID ", id);
    return id;
  } catch (e) {
    console.log("Error ", e);
    throw e;
  }
}

module.exports = insertDocuments;
