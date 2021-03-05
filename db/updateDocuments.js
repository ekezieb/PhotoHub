async function updateDocuments(client, collection, query, data) {
  try {
    const _db = client.db("PhotoHub");
    const _collection = _db.collection(collection);
    console.log("Collection ready, updating ", data);
    await _collection.updateOne(query, data);
    console.log("Updated");
  } catch (e) {
    console.log("Error ", e);
    throw e;
  }
}

module.exports = updateDocuments;
