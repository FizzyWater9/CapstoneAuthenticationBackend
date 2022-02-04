const {MongoClient} = require('mongodb');
const uri = "mongodb://gamenode.online:27017"
const client = new MongoClient(uri);

async function addUser(user) {
    try {
        await client.connect();
        const database = client.db("user-data");
        const users = database.collection("userLogin")

        let response = await users.insertOne(user)
        return response;
    } finally {
        client.close();
    }
}

module.exports = addUser;