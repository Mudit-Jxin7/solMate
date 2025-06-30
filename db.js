const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("solana_bot");
const users = db.collection("users");

async function getUser(id) {
  await client.connect();
  return users.findOne({ telegram_id: id });
}

async function createUser(id, publicKey, secretKey) {
  await client.connect();
  return users.insertOne({ telegram_id: id, publicKey, secretKey });
}

module.exports = { getUser, createUser };
