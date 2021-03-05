async function findDocuments(client, collection, query = {}) {
  try {
    const _db = client.db("PhotoHub");
    const _collection = _db.collection(collection);
    console.log("Collection ready, querying ", query);
    const res = await _collection.find(query).toArray();
    console.log("Find ", res);
    return res;
  } catch (e) {
    console.log("Error ", e);
    throw e;
  }
}

module.exports = findDocuments;
