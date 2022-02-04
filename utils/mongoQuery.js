const {MongoClient} = require('mongodb');
const uri = "mongodb://gamenode.online:27017"
const client = new MongoClient(uri);

async function query(query) {
    try {
        await client.connect();
        const database = client.db("user-data");
        const users = database.collection("userLogin")

        if (query === '') {
            let userData = await users.find().toArray();
            return userData;
        } else {
            let userData = await users.find(query).toArray();
            return userData;
        }

    } finally {
        client.close();
    }
}

module.exports = query;