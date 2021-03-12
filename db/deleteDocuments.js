async function deleteDocuments(client, collection, query) {
  try {
    const _db = client.db("PhotoHub");
    const _collection = _db.collection(collection);
    console.log("Collection ready, deleting", query);
    await _collection.deleteOne(query);
    console.log("Deleted");
  } catch (e) {
    console.log("Error ", e);
    throw e;
  }
}

module.exports = deleteDocuments;
