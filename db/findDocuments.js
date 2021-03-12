async function findDocuments(client, collection, query = {}) {
  try {
    const _db = client.db("PhotoHub");
    const _collection = _db.collection(collection);
    console.log("Collection ready, querying ", query);
    return await _collection.find(query).sort({ _id: -1 }).toArray();
  } catch (e) {
    console.log("Error ", e);
    throw e;
  }
}

module.exports = findDocuments;
